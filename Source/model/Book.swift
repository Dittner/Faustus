//
//  Book.swift
//  Faustus
//
//  Created by Alexander Dittner on 28.03.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class Book: ObservableObject, ConspectusContent {
    let id: UID
    @Published var title: String = ""
    @Published var subTitle: String = ""
    @Published var ISBN: String = ""
    @Published var writtenDate: String = ""
    @Published var publishedDate: String = ""
    @Published var pageCount: String = ""
    @Published var publisher: String = ""
    @Published var place: String = ""
    @Published var info: String = "Keine Inhaltsangabe"
    @Published var author: String = ""
    @Published var authorID: UID?
    @Published var hasChanges: Bool = false
    private var disposeBag: Set<AnyCancellable> = []

    required init(id: UID) {
        self.id = id

        for prop in [$title, $subTitle, $ISBN, $writtenDate, $publishedDate, $pageCount, $publisher, $place, $info, $author] {
            prop
                .removeDuplicates()
                .map { _ in
                    true
                }
                .assign(to: \.hasChanges, on: self)
                .store(in: &disposeBag)
        }

        $authorID
            .removeDuplicates()
            .map { _ in
                true
            }
            .assign(to: \.hasChanges, on: self)
            .store(in: &disposeBag)
    }

    func hasChangesToStore() -> Bool {
        hasChanges
    }

    func didStore() {
        hasChanges = false
    }
    
    func conspectusDidChange() {
        hasChanges = true
    }

    func validate() -> ValidationStatus {
        if title.isEmpty { return .emptyBookTitle }
        if writtenDate.isEmpty { return .emptyWrittenYear }
        if author.isEmpty && authorID == nil { return .emptyBookAuthor }
        return .ok
    }

    func serialize() -> [String: Any] {
        var dict: [String: Any] = ["id": id,
                                   "title": title,
                                   "subTitle": subTitle,
                                   "ISBN": ISBN,
                                   "writtenDate": writtenDate,
                                   "publishedDate": publishedDate,
                                   "pageCount": pageCount,
                                   "publisher": publisher,
                                   "place": place,
                                   "info": info,
                                   "author": author
        ]

        if let authorID = authorID {
            dict["authorID"] = authorID
        }
        return dict
    }

    func deserialize(from dict: [String: Any]) {
        title = dict["title"] as? String ?? ""
        subTitle = dict["subTitle"] as? String ?? ""
        ISBN = dict["ISBN"] as? String ?? ""
        writtenDate = dict["writtenDate"] as? String ?? ""
        publishedDate = dict["publishedDate"] as? String ?? ""
        pageCount = dict["pageCount"] as? String ?? ""
        publisher = dict["publisher"] as? String ?? ""
        place = dict["place"] as? String ?? ""
        info = dict["info"] as? String ?? ""
        author = dict["author"] as? String ?? ""
        authorID = dict["authorID"] as? UID
        hasChanges = false
    }
    
    func removeLinks(with conspectus:Conspectus) {
        if let authorID = authorID, let author = conspectus.asAuthor, authorID == author.id {
            self.authorID = nil
        }
    }
}

extension Conspectus {
    var asBook: Book? { return content as? Book }
}
