//
//  TagsChooserController.swift
//  Faustus
//
//  Created by Alexander Dittner on 14.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class TagsChooserController: ObservableObject, ChooserController {
    enum ChooserResult {
        case selected(added: [Tag], removed: [Tag])
        case canceled
    }

    @Published var owner: Conspectus!
    @Published var tagTree: TagTree!
    @Published var selectedTags: [Tag] = []
    @Published var result: ChooserResult = .canceled

    private var disposeBag: Set<AnyCancellable> = []

    func show(_ owner: Conspectus, _ bibliography: Bibliography) {
        self.owner = owner
        selectedTags = owner.linkColl.links.map { $0 as? Tag }.compactMap { $0 }

        let tags = bibliography.getValues()
            .filter { $0 is Tag && !$0.state.isRemoved }
            .map { $0 as! Tag }
            .sorted { $0.content.name < $1.content.name }

        tagTree = TagTree(tags)
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
        result = .canceled
    }

    func apply() {
        var added:[Tag] = []
        var removed:[Tag] = []
        
        let initialTags = owner.linkColl.links.map { $0 as? Tag }.compactMap { $0 }
        
        for t in selectedTags {
            if !initialTags.contains(t) {
                added.append(t)
            }
        }

        for t in initialTags {
            if !selectedTags.contains(t) {
                removed.append(t)
            }
        }
        
        result = .selected(added: added, removed: removed)
    }
}
