//
//  Conspectus.swift
//  Faustus
//
//  Created by Alexander Dittner on 10.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

enum ValidationStatus: String {
    case ok
    case emptyName = "Das Feld Name ist nicht gefüllt"
    case emptyPassword = "Das Feld Schlüssel ist nicht gefüllt"
    case invalidUserPwd = "Schlüssel ist ungültig"
    case emptyBirthYear = "Das Feld Geboren ist nicht gefüllt"
    case lifeIsTooLong = "Die Lebensdauer ist zu lang"
    case emptyBookTitle = "Das Feld Titel ist nicht gefüllt"
    case emptyBookAuthor = "Das Feld Author ist nicht gefüllt"
    case emptyWrittenYear = "Das Feld Geschrieben ist nicht gefüllt"
    case emptyQuote = "Der Text eines Zitates ist nicht gefüllt"
    case emptyPage = "Die Seitennummer eines Zitates ist nicht gefüllt"
    case duplicate = "Ein Duplikat gefunden"
    case failedToWrite = "Das Speichern ist fehlgeschlagen!"
    case invalidQuote = "Ein Zitat ist nicht gefüllt"
}

enum ConspectusGenus: Int, Comparable {
    static func < (lhs: ConspectusGenus, rhs: ConspectusGenus) -> Bool {
        lhs.rawValue < rhs.rawValue
    }

    case tag
    case author
    case book
    case quote
    case user

    func toIconName() -> String {
        switch self {
        case .user:
            return "user"
        case .author:
            return "author"
        case .book:
            return "book"
        case .tag:
            return "tag"
        case .quote:
            return "quote"
        }
    }
}

class ConspectusState: ObservableObject {
    @Published var changedDate: String = ""
    @Published var createdDate: String = ""
    @Published var validationStatus: ValidationStatus = .ok
    @Published var isEditing: Bool = false
    @Published private(set) var hasChanges: Bool = true
    @Published var isRemoved: Bool = false
    var isNew: Bool = false
    var isDestroyed: Bool = false
    var changedTime: Double = 0

    private var disposeBag: Set<AnyCancellable> = []

    func markAsChanged() {
        if !hasChanges {
            hasChanges = true
        }
    }

    func markAsNotChanged() {
        if hasChanges {
            hasChanges = false
        }
    }

    init() {
        $isRemoved
            .dropFirst()
            .removeDuplicates()
            .sink { _ in
                self.hasChanges = true
            }
            .store(in: &disposeBag)
    }
}

class LinkColl: ObservableObject {
    var owner: Conspectus!
    @Published var links: [Conspectus] = []

    func removeLink(from c: Conspectus) {
        for (ind, link) in links.enumerated() {
            if link.id == c.id {
                links.remove(at: ind)
                c.linkColl.removeLink(from: owner)

                if let tag = c as? Tag {
                    let tagsChildren = links.filter { $0 is Tag && ($0 as! Tag).content.parentTag == tag }
                    for child in tagsChildren {
                        removeLink(from: child)
                    }
                }

                _ = owner.store(forced: true)

                break
            }
        }
    }

    func removeAllLinks() {
        if links.count > 0 {
            let deletingLinks = links
            links = []

            for link in deletingLinks {
                link.linkColl.removeLink(from: owner)
            }
            _ = owner.store(forced: true)
        }
    }

    func addLink(to c: Conspectus) {
        if links.first(where: { $0.id == c.id }) == nil {
            links.append(c)
            c.linkColl.addLink(to: owner)
            _ = owner.store(forced: true)
        }
    }
}

class Conspectus: Comparable, Equatable {
    static func < (lhs: Conspectus, rhs: Conspectus) -> Bool {
        if lhs.genus == rhs.genus {
            switch lhs.genus {
            case .tag:
                return (lhs as! Tag).content.name < (rhs as! Tag).content.name
            case .author:
                return (lhs as! Author).content.surname < (rhs as! Author).content.surname
            case .book:
                return (lhs as! Book).content.writtenDate > (rhs as! Book).content.writtenDate
            case .quote:
                if (lhs as! Quote).book == (rhs as! Quote).book {
                    return (lhs as! Quote).startPage < (rhs as! Quote).startPage
                } else {
                    return (lhs as! Quote).book.content.writtenDate > (rhs as! Quote).book.content.writtenDate
                }
            case .user:
                return (lhs as! User).content.name < (rhs as! User).content.name
            }
        } else {
            return lhs.genus < rhs.genus
        }
    }

    let id: UID
    var fileUrl: URL?
    var fileData: [String: Any]?

    var uniqueNameBeforeChanges: String = ""

    var genus: ConspectusGenus {
        /* abstract */ return nil!
    }

    let state: ConspectusState
    let linkColl: LinkColl
    let bibliography: Bibliography

    private var disposeBag: Set<AnyCancellable> = []

    static func == (lhs: Conspectus, rhs: Conspectus) -> Bool {
        return lhs.id == rhs.id
    }

    init?(from url: URL) {
        if let dict = DocumentsStorage.readFile(from: url) {
            id = dict["id"] as! UID
            fileUrl = url
            fileData = dict
            state = ConspectusState()
            bibliography = AppModel.shared.bibliography
            linkColl = LinkColl()
            linkColl.owner = self
            state.isNew = false
            state.isEditing = false
            deserialize()
            bibliography.write(self)
        } else {
            return nil
        }

        didInit()
    }

    init(location: StorageDirectory) {
        id = UID()
        state = ConspectusState()

        state.isNew = true
        state.isEditing = true

        let now = Date()
        state.createdDate = DateTimeUtils.localize(now)
        state.changedDate = DateTimeUtils.localize(now)
        state.changedTime = now.timeIntervalSince1970

        fileUrl = DocumentsStorage.projectURL.appendingPathComponent(location.rawValue + "/" + id.description + ".faustus")

        bibliography = AppModel.shared.bibliography
        linkColl = LinkColl()

        linkColl.owner = self

        bibliography.write(self)
        didInit()
    }

    init(fileData: [String: Any]?) {
        if let dict = fileData, let uid = dict["id"] as? UID {
            id = uid
        } else {
            id = UID()
        }

        state = ConspectusState()
        state.isNew = false
        state.isEditing = false

        self.fileData = fileData

        bibliography = AppModel.shared.bibliography
        linkColl = LinkColl()
        linkColl.owner = self

        deserialize()
        bibliography.write(self)
        didInit()
    }

    func didInit() {}

    static func getDirLocation(by genus: ConspectusGenus) -> StorageDirectory {
        switch genus {
        case .author:
            return .authors
        case .user:
            return .user
        case .book:
            return .books
        case .tag:
            return .tags
        case .quote:
            return .books
        }
    }

    func getDescription(detailed: Bool = true) -> String {
        /* abstract */ return nil!
    }

    func getHashName() -> String {
        /* abstract */ return nil!
    }

    var storeDebouncer: Debouncer = Debouncer(seconds: 0.25)

    func store(forced: Bool = false) {
        guard !state.isDestroyed else { return }
        if forced {
            state.markAsChanged()
        } else if !state.hasChanges {
            return
        }

        storeDebouncer.debounce {
            self.executeStore()
        }
    }

    private func executeStore() {
        state.validationStatus = validate()

        if state.validationStatus == .ok {
            let oldHashName = fileData?["hashName"] as? String ?? ""
            if write(dict: serialize()) {
                state.isNew = false
                state.markAsNotChanged()
                AppModel.shared.bibliography.update(self, oldHashName: oldHashName)
            } else {
                state.validationStatus = .failedToWrite
                if AppModel.shared.selectedConspectus != self {
                    show()
                }
            }
        }
    }

    func validate() -> ValidationStatus {
        return AppModel.shared.bibliography.hasDuplicate(of: self) ? .duplicate : .ok
    }

    func serialize() -> [String: Any] {
        let now = Date()
        state.changedDate = DateTimeUtils.localize(now)
        state.changedTime = now.timeIntervalSince1970

        var dict: [String: Any] = [:]
        dict["id"] = id
        dict["createdDate"] = state.createdDate
        dict["changedTime"] = state.changedTime
        dict["changedDate"] = state.changedDate
        dict["isRemoved"] = state.isRemoved
        dict["links"] = linkColl.links.map { $0.id }
        return dict
    }

    func deserialize() {
        if let dict = fileData {
            state.createdDate = dict["createdDate"] as? String ?? DateTimeUtils.localize(Date())
            state.changedDate = dict["changedDate"] as? String ?? DateTimeUtils.localize(Date())
            state.changedTime = dict["changedTime"] as? Double ?? 0
            state.isRemoved = dict["isRemoved"] as? Bool ?? false
        }
    }

    func deserializeLinkedFiles() {
        if let dict = fileData {
            if let linksIDs = dict["links"] as? [UID] {
                linkColl.links = linksIDs.map { bibliography.read($0) }.compactMap { $0 }.sorted { $0 < $1 }
            }
        }
        state.markAsNotChanged()
    }

    private func write(dict: [String: Any]) -> Bool {
        guard let fileUrl = fileUrl else { return false }
        do {
            let data = try JSONSerialization.data(withJSONObject: dict, options: .fragmentsAllowed)
            try data.write(to: fileUrl)

            fileData = dict
            logInfo(tag: .IO, msg: "file with url = \(fileUrl) has been stored!")
            return true
        } catch {
            logErr(tag: .IO, msg: "Unable to write file with url: \(fileUrl), error: \(error.localizedDescription)")
            return false
        }
    }

    func show() {
        AppModel.shared.select(self)
    }

    func remove() {
        state.isRemoved = true
    }

    func destroy() {
        state.isDestroyed = true
        if let fileUrl = fileUrl {
            DocumentsStorage.deleteFile(from: fileUrl)
        }
        linkColl.removeAllLinks()
        bibliography.remove(self)
    }
}
