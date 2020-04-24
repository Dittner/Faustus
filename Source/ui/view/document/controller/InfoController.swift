//
//  InfoController.swift
//  Faustus
//
//  Created by Alexander Dittner on 19.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class InfoController: ObservableObject {
    @Published var info: String = ""
    @Published var parentTag: Tag?
    @Published var owner: Conspectus!

    var infoPublisher: AnyCancellable?
    var parentTagPublisher: AnyCancellable?
    func update(_ conspectus: Conspectus) {
        infoPublisher?.cancel()
        parentTagPublisher?.cancel()
        owner = conspectus
        if let tag = conspectus as? Tag {
            parentTagPublisher = tag.content.$parentTag
                .assign(to: \.parentTag, on: self)

            info = tag.content.info
            infoPublisher = $info
                .sink { value in
                    tag.content.info = value
                }

        } else if let author = conspectus as? Author {
            parentTag = nil

            info = author.content.info
            infoPublisher = $info
                .sink { value in
                    author.content.info = value
                }
        } else {
            parentTag = nil
        }
    }

    func removeParentTag() {
        if let tag = owner as? Tag {
            tag.content.parentTag = nil
        }
    }
}
