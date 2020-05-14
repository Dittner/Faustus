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
    @Published var ownerLinks: [Conspectus] = []
    @Published var ownerTags: [Tag] = []
    @Published var isExpanded: Bool = false
    var tagTree: TagTree = TagTree([])
    var ownerLinksPublisher: AnyCancellable?

    init() {
        ownerLinksPublisher = $owner
            .compactMap { $0 }
            .flatMap { owner in
                owner.linkColl.$links
            }
            .debounce(for: 0.2, scheduler: RunLoop.main)
            .map { links in
                let tags = self.model.bibliography.getValues()
                    .filter { $0 is Tag && !$0.state.isRemoved }
                    .sorted { $0 < $1 }
                    .map { $0 as! Tag }

                return TagTree(tags).flatTree { links.contains($0) }
            }
            .assign(to: \.ownerTags, on: self)
    }

    func update(_ conspectus: Conspectus) {
        if !(conspectus is Tag || conspectus is User) {
            owner = conspectus
            ownerLinks = owner.linkColl.links
        }
    }

    func removeTag(_ t: Tag) {
        owner.linkColl.removeLink(from: t)
    }
}
