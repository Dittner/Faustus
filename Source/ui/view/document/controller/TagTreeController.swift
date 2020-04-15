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
    @Published var selectedTag: Tag?
    @Published var tagNodes: [TagTreeNode] = []
    var tagTree:TagTree = TagTree([])

    func update(_ owner: Conspectus, _ bibliography: Bibliography) {
        if !(owner is Tag || owner is User) {
            self.owner = owner

            let tags = bibliography.getValues()
                .filter { $0 is Tag && !$0.state.isRemoved }
                .map { $0 as! Tag }
                .sorted { $0.content.name < $1.content.name }

            tagTree = TagTree(tags)
            tagNodes = tagTree.compactTree { self.owner.linkColl.links.contains($0.tag) }
            print("TagTreeController, tagNodes count = \(tagNodes.count)")
        }
    }
    
    var chooseTagsPublisher: AnyCancellable?
    func chooseTags() {
        chooseTagsPublisher?.cancel()
        chooseTagsPublisher = rootVM.chooseTags(owner: owner)
            .sink { added, removed in
                print("chooseTags has result")
                for t in added {
                    self.owner.linkColl.addLink(to: t)
                }

                for t in removed {
                    self.owner.linkColl.removeLink(from: t)
                }
                
                self.tagNodes = self.tagTree.compactTree { self.owner.linkColl.links.contains($0.tag) }
            }
    }
    
    func removeTag(_ t:Tag) {
        owner.linkColl.removeLink(from: t)
        self.tagNodes = self.tagTree.compactTree { self.owner.linkColl.links.contains($0.tag) }
    }
}
