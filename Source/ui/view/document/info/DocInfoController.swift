//
//  InfoController.swift
//  Faustus
//
//  Created by Alexander Dittner on 19.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class DocInfoController: ObservableObject {
    @Published var info: String = ""
    @Published var parentTag: Tag?
    @Published var owner: Conspectus!
    @Published var isExpanded: Bool = false

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
            tag.content.updateParent(with: nil)
        }
    }

    var loadInfoFromInternetPublisher: AnyCancellable?
    func loadInfoFromInternet() {
        loadInfoFromInternetPublisher?.cancel()
        guard let bookContent = (owner as? Book)?.content else { return }

        if !bookContent.ISBN.isEmpty {
            loadInfoFromInternetPublisher = NetworkManager.loadBookInfo(isbn: bookContent.ISBN)
                .receive(on: RunLoop.main)
                .compactMap { $0 }
                .sink { value in
                    if !value.title.isEmpty {
                        bookContent.fullTitle = value.title
                        if bookContent.title.isEmpty {
                            bookContent.title = value.title
                        }
                    }

                    if !value.subtitle.isEmpty {
                        bookContent.subTitle = value.subtitle
                    }

                    if !value.description.isEmpty {
                        bookContent.info = value.description
                    }

                    if !value.publishedDate.isEmpty {
                        bookContent.publishedDate = value.publishedDate
                    }

                    if !value.publisher.isEmpty {
                        bookContent.publisher = value.publisher
                    }

                    if let pageCount = value.pageCount, pageCount > 0 {
                        bookContent.pageCount = String(pageCount)
                    }

                    if value.authors.count > 0 {
                        bookContent.authorText = value.authors.reduce("") { $0 + ", " + $1 }.substring(from: 2)
                    }
                }
        }
    }
}
