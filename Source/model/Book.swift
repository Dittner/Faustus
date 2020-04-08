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
    @Published var authorText: String = ""
    @Published var author: Conspectus?
    @Published var hasChanges: Bool = false
    private var disposeBag: Set<AnyCancellable> = []

    required init(id: UID) {
        self.id = id

        for prop in [$title, $subTitle, $ISBN, $writtenDate, $publishedDate, $pageCount, $publisher, $place, $info, $authorText] {
            prop
                .removeDuplicates()
                .map { _ in
                    true
                }
                .assign(to: \.hasChanges, on: self)
                .store(in: &disposeBag)
        }

        $author
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
        if authorText.isEmpty && author == nil { return .emptyBookAuthor }
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
                                   "authorText": authorText,
        ]

        if let author = author {
            dict["authorID"] = author.id
        }
        return dict
    }

    func deserialize(from dict: [String: Any], bibliography: Bibliography) {
        title = dict["title"] as? String ?? ""
        subTitle = dict["subTitle"] as? String ?? ""
        ISBN = dict["ISBN"] as? String ?? ""
        writtenDate = dict["writtenDate"] as? String ?? ""
        publishedDate = dict["publishedDate"] as? String ?? ""
        pageCount = dict["pageCount"] as? String ?? ""
        publisher = dict["publisher"] as? String ?? ""
        place = dict["place"] as? String ?? ""
        info = dict["info"] as? String ?? ""
        authorText = dict["authorText"] as? String ?? ""
        if let authorID = dict["authorID"] as? UID {
            author = bibliography.read(authorID)
        }
        hasChanges = false
    }

    func removeLinks(with conspectus: Conspectus) {
        if let author = author, author == conspectus {
            self.author = nil
        }
    }

    func getUniqueName() -> String {
        return "book" + title + writtenDate
    }
}

extension Conspectus {
    var asBook: Book? { return content as? Book }
}
