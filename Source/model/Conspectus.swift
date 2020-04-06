//
//  Conspectus.swift
//  Faustus
//
//  Created by Alexander Dittner on 28.03.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

enum ConspectusGenus: String {
    case asUser
    case asAuthor
    case asBook
    case asTag

    func create(id: UID) -> Storable? {
        switch self {
        case .asBook:
            return Book(id: id)
        case .asTag:
            return Tag(id: id)
        case .asAuthor:
            return Author(id: id)
        case .asUser:
            return User(id: id)
        }
    }
}

class Conspectus: ObservableObject, Equatable {
    static func == (lhs: Conspectus, rhs: Conspectus) -> Bool {
        return lhs.id == rhs.id
    }

    let id: UID
    let fileUrl: URL
    let content: Storable
    let createdDate: String
    private(set) var changedDate: String
    let genus: ConspectusGenus
    private(set) var isNew: Bool = false

    @Published var validationStatus: ValidationStatus = .ok
    @Published var isEditing: Bool = false
    @Published var isRemoved: Bool = false
    private var disposeBag: Set<AnyCancellable> = []

    init?(genus: ConspectusGenus, from url: URL) {
        guard let data = DocumentsStorage.readFile(from: url) else { return nil }
        do {
            if let dict = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                if let uid = dict["id"] as? UID {
                    id = uid
                    fileUrl = url
                    self.genus = genus
                    createdDate = dict["createdDate"] as? String ?? DateTimeUtils.localize(Date())
                    changedDate = dict["changedDate"] as? String ?? DateTimeUtils.localize(Date())
                    isRemoved = dict["isRemoved"] as? Bool ?? false
                    content = genus.create(id: uid)!
                    content.deserialize(from: dict)
                    subscribeToIsRemoved()
                } else {
                    logErr(tag: .PARSING, msg: "Failed to read id from conspectus for a file \(url)")
                    return nil
                }

            } else {
                logErr(tag: .PARSING, msg: "Failed to transform conspectus dict to [String: Any] for a file \(url)")
                return nil
            }

        } catch let error as NSError {
            logErr(tag: .PARSING, msg: "Failed to parse json data to [String: Any] for a file \(url): \(error.localizedDescription)")
            return nil
        }
    }

    init(genus: ConspectusGenus) {
        id = UID()
        self.genus = genus
        createdDate = DateTimeUtils.localize(Date())
        changedDate = createdDate
        content = genus.create(id: id)!

        let fileDir: String = Conspectus.genus2dir(genus).rawValue

        fileUrl = DocumentsStorage.projectURL.appendingPathComponent(fileDir + "/" + id.description + ".faustus")

        isEditing = true
        isNew = true
        subscribeToIsRemoved()
    }

    func subscribeToIsRemoved() {
        $isRemoved.dropFirst()
            .removeDuplicates()
            .sink { _ in self.content.didConspectusChange() }
            .store(in: &disposeBag)
    }

    private static func genus2dir(_ genus: ConspectusGenus) -> StorageDirectory {
        switch genus {
        case .asAuthor:
            return .authors
        case .asUser:
            return .user
        case .asBook:
            return .books
        case .asTag:
            return .tags
        }
    }

    private func write(dict: [String: Any]) -> Bool {
        do {
            var updateDict = dict
            changedDate = DateTimeUtils.localize(Date())
            updateDict["createdDate"] = createdDate
            updateDict["changedDate"] = changedDate
            updateDict["isRemoved"] = isRemoved

            let data = try JSONSerialization.data(withJSONObject: updateDict, options: .fragmentsAllowed)

            try data.write(to: fileUrl)
            logInfo(tag: .IO, msg: "file with url = \(fileUrl) has been stored!")
            return true
        } catch {
            logErr(tag: .IO, msg: "Unable to write file with url: \(fileUrl), error: \(error.localizedDescription)")
            return false
        }
    }

    func store() -> StoreResult {
        guard content.hasChangesToStore() else {
            return .noChangesToStore
        }

        validationStatus = content.validate()
        if validationStatus == .ok {
            if write(dict: content.serialize()) {
                isNew = false
                content.didStore()
                return .stored
            } else {
                return .failed
            }
        } else {
            return .failed
        }
    }

    func read(id: UID) -> Conspectus? {
        AppModel.shared.bibliography.read(id)
    }

    func show() {
        AppModel.shared.select(self)
    }

    func remove() {
        isRemoved = true
    }

    func destroy() {
    }

    public var description: String {
        switch genus {
        case .asAuthor:
            return "Conspectus.asAuthor <\(asAuthor!.name)>"
        case .asTag:
            return "Conspectus.asTag <\(asTag!.name)>"
        case .asBook:
            return "Conspectus.asBook <\(asBook!.title)>"
        case .asUser:
            return "Conspectus.asUser <\(asUser!.surname)>"
        }
    }
}
