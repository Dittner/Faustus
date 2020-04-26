//
//  Tag.swift
//  Faustus
//
//  Created by Alexander Dittner on 11.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class TagContent: ObservableObject {
    var owner: Tag!
    @Published var name: String = ""
    @Published var info: String = "Keine"
    @Published fileprivate(set) var parentTag: Tag?
    @Published fileprivate(set) var children: [Tag] = []
    
    func getLevel() -> Int {
        return parentTag == nil ? 0 : parentTag!.content.getLevel() + 1
    }

    func updateParent(with tag: Tag?) {
        if parentTag != tag {
            if let parent = parentTag {
                parent.content.children.removeAll { $0 == owner }
                parent.store(forced: true)
            }

            if let newParent = tag {
                newParent.content.children.append(owner)
                newParent.content.children = newParent.content.children.sorted { $0 < $1 }
                newParent.store(forced: true)
            }

            parentTag = tag
            owner.store(forced: true)
        }
    }
}

class Tag: Conspectus, ObservableObject, Comparable {
    static func < (lhs: Tag, rhs: Tag) -> Bool {
        lhs.content.name < rhs.content.name
    }
    
    @ObservedObject var content: TagContent = TagContent()

    override var genus: ConspectusGenus { return .tag }

    private var disposeBag: Set<AnyCancellable> = []
    override func didInit() {
        content.owner = self

        for prop in [content.$name, content.$info] {
            prop
                .removeDuplicates()
                .sink { _ in
                    self.state.markAsChanged()
                }
                .store(in: &disposeBag)
        }
    }

    override func validate() -> ValidationStatus {
        let conspectusValidation = super.validate()
        if conspectusValidation != .ok {
            state.validationStatus = conspectusValidation
        } else if content.name.isEmpty {
            state.validationStatus = .emptyName
        } else {
            state.validationStatus = .ok
        }
        return state.validationStatus
    }

    override func serialize() -> [String: Any] {
        var dict = super.serialize()
        dict["name"] = content.name
        dict["info"] = content.info

        if let superTag = content.parentTag {
            dict["parentTagID"] = superTag.id
        }

        dict["childrenIDs"] = content.children.map { $0.id }

        return dict
    }

    override func deserialize() {
        super.deserialize()
        if let dict = fileData {
            content.name = dict["name"] as? String ?? ""
            content.info = dict["info"] as? String ?? ""

            description = content.name
            hashName = "tag" + content.name
        }
    }

    override func deserializeLinkedFiles() {
        super.deserializeLinkedFiles()
        if let dict = fileData {
            if let parentTagID = dict["parentTagID"] as? UID {
                content.parentTag = bibliography.read(parentTagID) as? Tag
            }

            if let childrenIDs = dict["childrenIDs"] as? [UID] {
                content.children = childrenIDs.map { bibliography.read($0) as? Tag }.compactMap { $0 }
            }
        }

        state.markAsNotChanged()
    }

    override func didDestroy(_ conspectus: Conspectus) {
        super.didDestroy(conspectus)
        if let parent = content.parentTag, parent.id == conspectus.id, let tag = conspectus as? Tag {
            content.parentTag = tag.content.parentTag == nil ? nil : tag.content.parentTag
        }
    }
}
