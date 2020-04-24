//
//  TagTreeController.swift
//  Faustus
//
//  Created by Alexander Dittner on 14.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class TagTreeController: ViewModel, ChooserController {
    @Published var owner: Conspectus!
    @Published var ownerTagNodes: [TagTreeNode] = []
    var tagTree:TagTree = TagTree([])

    func update(_ conspectus: Conspectus) {
        if !(conspectus is Tag || conspectus is User) {
            self.owner = conspectus
            isChoosing = false

            let tags = model.bibliography.getValues()
                .filter { $0 is Tag && !$0.state.isRemoved }
                .map { $0 as! Tag }
                .sorted { $0.content.name < $1.content.name }

            tagTree = TagTree(tags)
            allTagNodes = tagTree.nodeList
            ownerTagNodes = tagTree.compactTree { self.owner.linkColl.links.contains($0.tag) }
        }
    }
    
    func removeTag(_ t:Tag) {
        owner.linkColl.removeLink(from: t)
        self.ownerTagNodes = self.tagTree.compactTree { self.owner.linkColl.links.contains($0.tag) }
    }
    
    //choosing
    
    @Published var selectedTags: [Tag] = []
    @Published var isChoosing: Bool = false
    @Published var allTagNodes: [TagTreeNode] = []
    private var disposeBag: Set<AnyCancellable> = []
    var chooseTagsPublisher: AnyCancellable?
    func chooseTags() {
        isChoosing = true
        selectedTags = owner.linkColl.links.map { $0 as? Tag }.compactMap { $0 }
    }
    
    func selectDeselect(_ tag: Tag) {
        var res = selectedTags

        if selectedTags.contains(tag) {
            deselect(tag, &res)
        } else {
            select(tag, &res)
        }

        selectedTags = res
    }

    private func deselect(_ t: Tag, _ src: inout [Tag]) {
        for (ind, tag) in src.enumerated() {
            if t == tag {
                src.remove(at: ind)
                let children = src.filter { $0.content.parentTag == t }
                for childTag in children {
                    deselect(childTag, &src)
                }
            }
        }
    }

    private func select(_ t: Tag, _ src: inout [Tag]) {
        src.append(t)
        if let parentTag = t.content.parentTag, !src.contains(parentTag) {
            select(parentTag, &src)
        }
    }

    func cancel() {
        isChoosing = false
    }

    func apply() {
        let initialTags = owner.linkColl.links.map { $0 as? Tag }.compactMap { $0 }
        
        for t in selectedTags {
            if !initialTags.contains(t) {
                self.owner.linkColl.addLink(to: t)
            }
        }

        for t in initialTags {
            if !selectedTags.contains(t) {
                self.owner.linkColl.removeLink(from: t)
            }
        }
        
        ownerTagNodes = tagTree.compactTree { self.owner.linkColl.links.contains($0.tag) }
        isChoosing = false
    }
}
