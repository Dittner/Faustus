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
    @Published var name: String = ""
    @Published var info: String = "Keine"
    @Published var parentTag: Tag?
}

class Tag: Conspectus, ObservableObject {
    @ObservedObject var content: TagContent = TagContent()

    override var genus: ConspectusGenus { return .tag }

    override var description: String {
        return content.name
    }

    override var hashName: String {
        return "tag" + content.name
    }

    private var disposeBag: Set<AnyCancellable> = []
    override func didInit() {
        for prop in [content.$name, content.$info] {
            prop
                .removeDuplicates()
                .sink { _ in
                    self.state.markAsChanged()
                }
                .store(in: &disposeBag)
        }

        content.$parentTag
            .removeDuplicates()
            .sink { _ in
                self.state.markAsChanged()
            }
            .store(in: &disposeBag)
    }

    override func validate() -> ValidationStatus {
        let conspectusValidation = super.validate()
        if conspectusValidation != .ok { return conspectusValidation }
        if content.name.isEmpty { return .emptyName }
        return .ok
    }

    override func serialize() -> [String: Any] {
        var dict = super.serialize()
        dict["name"] = content.name
        dict["info"] = content.info

        if let superTag = content.parentTag {
            dict["parentTagID"] = superTag.id
        }

        return dict
    }

    override func deserialize(_ bibliography: Bibliography) {
        super.deserialize(bibliography)
        if let dict = fileData {
            content.name = dict["name"] as? String ?? ""
            content.info = dict["info"] as? String ?? ""
            if let parentTagID = dict["parentTagID"] as? UID {
                content.parentTag = bibliography.read(parentTagID) as? Tag
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
