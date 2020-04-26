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
    @Published var tags: [Tag] = []

    func update(_ conspectus: Conspectus) {
        if let tag = conspectus as? Tag {
            owner = tag
            isChoosing = false
        }
    }

    func chooseParentTag() {
        isChoosing = true
        selectedParentTag = owner.content.parentTag

        let allTags = model.bibliography.getValues()
            .filter { $0 is Tag && !$0.state.isRemoved }
            .map { $0 as! Tag }
            .sorted { $0 < $1 }

        let tagTree = TagTree(allTags)
        tags = tagTree.flatTree { $0.id != self.owner.id }
    }

    func cancel() {
        isChoosing = false
    }

    func apply() {
        isChoosing = false
        owner.content.updateParent(with: selectedParentTag)
    }
}
