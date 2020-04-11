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
}

enum StoreResult: String {
    case stored
    case noChangesToStore
    case failed
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

class Conspectus: ObservableObject, Equatable {
    let id: UID
    let fileUrl: URL
    var fileData: [String: Any]?
    var changedDate: String = ""
    var createdDate: String = ""
    var isNew: Bool

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

    @Published var validationStatus: ValidationStatus = .ok
    @Published var isEditing: Bool
    @Published var hasChanges: Bool = true
    @Published var isRemoved: Bool = false

    private var disposeBag: Set<AnyCancellable> = []

    static func == (lhs: Conspectus, rhs: Conspectus) -> Bool {
        return lhs.id == rhs.id
    }

    init?(from url: URL) {
        if let dict = DocumentsStorage.readFile(from: url) {
            id = dict["id"] as! UID
            fileUrl = url
            fileData = dict
            isNew = false
            isEditing = false

        } else {
            return nil
        }

        $isRemoved
            .dropFirst()
            .removeDuplicates()
            .sink { _ in
                self.changedDate = DateTimeUtils.localize(Date())
            }
            .store(in: &disposeBag)

        didInit()
    }

    init(location: StorageDirectory) {
        id = UID()
        fileData = nil
        isNew = true
        isEditing = true

        fileUrl = DocumentsStorage.projectURL.appendingPathComponent(location.rawValue + "/" + id.description + ".faustus")

        $isRemoved.dropFirst()
            .removeDuplicates()
            .sink { _ in
                self.changedDate = DateTimeUtils.localize(Date())
            }
            .store(in: &disposeBag)

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

    func store() -> StoreResult {
        guard hasChanges else {
            return .noChangesToStore
        }

        validationStatus = validate()
        if validationStatus == .ok {
            validationStatus = AppModel.shared.bibliography.hasDuplicate(of: self) ? .duplicate : .ok
        }
        if validationStatus == .ok {
            let oldHashName = fileData?["hashName"] as? String ?? ""
            if write(dict: serialize()) {
                isNew = false
                hasChanges = false
                AppModel.shared.bibliography.update(self, oldHashName: oldHashName)

                return .stored
            } else {
                return .failed
            }
        } else {
            return .failed
        }
    }

    func validate() -> ValidationStatus {
        return .ok
    }

    func serialize() -> [String: Any] {
        changedDate = DateTimeUtils.localize(Date())
        return ["id": id, "hashName": hashName, "createdDate": createdDate, "changedDate": changedDate, "isRemoved": isRemoved]
    }

    func deserialize(_ bibliography: Bibliography) {
        if let dict = fileData {
            createdDate = dict["createdDate"] as? String ?? DateTimeUtils.localize(Date())
            changedDate = dict["changedDate"] as? String ?? DateTimeUtils.localize(Date())
            isRemoved = dict["isRemoved"] as? Bool ?? false
        }

        hasChanges = false
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
        isRemoved = true
    }

    func removeLinks(with conspectus: Conspectus) {}

    func destroy() {
        DocumentsStorage.deleteFile(from: fileUrl)
    }

    func notifyChange() {
        objectWillChange.send()
        hasChanges = true
    }
}
