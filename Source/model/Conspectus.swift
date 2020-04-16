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

enum ConspectusGenus: String {
    case user
    case author
    case book
    case tag

    func create() -> Conspectus {
        switch self {
        case .user:
            return User(location: .user)
        case .author:
            return Author(location: .authors)
        case .book:
            return Book(location: .books)
        case .tag:
            return Tag(location: .tags)
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
                self.changedDate = DateTimeUtils.localize(Date())
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
            if link == c {
                links.remove(at: ind)
                c.linkColl.removeLink(from: owner)

                if let tag = c as? Tag {
                    let tagsChildren = links.filter { $0 is Tag && ($0 as! Tag).content.parentTag == tag }
                    for child in tagsChildren {
                        removeLink(from: child)
                    }
                }

                owner.state.markAsChanged()
                _ = owner.store()

                break
            }
        }
    }

    func addLink(to c: Conspectus) {
        if !links.contains(c) {
            links.append(c)
            c.linkColl.addLink(to: owner)
            owner.state.markAsChanged()
            _ = owner.store()
        }
    }
}

class Conspectus: Equatable {
    let id: UID
    let fileUrl: URL
    var fileData: [String: Any]?

    var uniqueNameBeforeChanges: String = ""
    var description: String {
        // Abstract property
        return nil!
    }

    var hashName: String {
        // Abstract property
        return nil!
    }

    var genus: ConspectusGenus {
        // Abstract property
        return nil!
    }

    let state: ConspectusState
    let linkColl: LinkColl

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
            linkColl = LinkColl()
            linkColl.owner = self
            state.isNew = false
            state.isEditing = false
        } else {
            return nil
        }

        didInit()
    }

    init(location: StorageDirectory) {
        id = UID()
        fileData = nil
        state = ConspectusState()

        state.isNew = true
        state.isEditing = true

        state.createdDate = DateTimeUtils.localize(Date())
        state.changedDate = DateTimeUtils.localize(Date())

        fileUrl = DocumentsStorage.projectURL.appendingPathComponent(location.rawValue + "/" + id.description + ".faustus")

        linkColl = LinkColl()
        linkColl.owner = self
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
        }
    }

    var storeDebouncer: Debouncer = Debouncer(seconds: 0.25)

    func store(forced: Bool = false) {
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
        state.changedDate = DateTimeUtils.localize(Date())

        var dict: [String: Any] = [:]
        dict["id"] = id
        dict["hashName"] = hashName
        dict["createdDate"] = state.createdDate
        dict["changedDate"] = state.changedDate
        dict["isRemoved"] = state.isRemoved
        dict["links"] = linkColl.links.map { $0.id }
        return dict
    }

    func deserialize(_ bibliography: Bibliography) {
        if let dict = fileData {
            state.createdDate = dict["createdDate"] as? String ?? DateTimeUtils.localize(Date())
            state.changedDate = dict["changedDate"] as? String ?? DateTimeUtils.localize(Date())
            state.isRemoved = dict["isRemoved"] as? Bool ?? false

            if let linksIDs = dict["links"] as? [UID] {
                linkColl.links = linksIDs.map { bibliography.read($0) }.compactMap { $0 }
            }
        }

        state.markAsNotChanged()
    }

    private func write(dict: [String: Any]) -> Bool {
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

    func didDestroy(_ conspectus: Conspectus) {
        linkColl.removeLink(from: conspectus)
    }

    func destroy() {
        DocumentsStorage.deleteFile(from: fileUrl)
    }
}
