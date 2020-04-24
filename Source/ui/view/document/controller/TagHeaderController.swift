//
//  TagHandlerController.swift
//  Faustus
//
//  Created by Alexander Dittner on 19.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import Foundation
import SwiftUI

class TagHeaderController: ViewModel, ChooserController {
    @Published var owner: Tag!
    @Published var selectedParentTag: Tag?
    @Published var isChoosing: Bool = false
    @Published var tagNodes: [TagTreeNode] = []

    func update(_ conspectus: Conspectus) {
        if let tag = conspectus as? Tag {
            owner = tag
            isChoosing = false
        }
    }

    func chooseParentTag() {
        isChoosing = true
        selectedParentTag = owner.content.parentTag

        let tags = model.bibliography.getValues()
            .filter { $0 is Tag && !$0.state.isRemoved }
            .map { $0 as! Tag }
            .sorted { $0.content.name < $1.content.name }

        let tagTree = TagTree(tags)
        tagNodes = tagTree.compactTree { $0.tag.id != self.owner.id }
    }

    func cancel() {
        isChoosing = false
    }

    func apply() {
        isChoosing = false
        owner.content.parentTag = selectedParentTag
    }
}
