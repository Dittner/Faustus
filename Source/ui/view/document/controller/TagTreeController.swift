//
//  TagTreeController.swift
//  Faustus
//
//  Created by Alexander Dittner on 14.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class TagTreeController: ViewModel {
    @Published var owner: Conspectus!
    @Published var ownerTags: [Tag] = []
    var tagTree:TagTree = TagTree([])

    func update(_ conspectus: Conspectus) {
        if !(conspectus is Tag || conspectus is User) {
            self.owner = conspectus

            let tags = model.bibliography.getValues()
                .filter { $0 is Tag && !$0.state.isRemoved }
                .map { $0 as! Tag }
                .sorted { $0 < $1 }

            tagTree = TagTree(tags)
            ownerTags = tagTree.flatTree { self.owner.linkColl.links.contains($0) }
        }
    }
    
    func removeTag(_ t:Tag) {
        owner.linkColl.removeLink(from: t)
        self.ownerTags = tagTree.flatTree { self.owner.linkColl.links.contains($0) }
    }

}
