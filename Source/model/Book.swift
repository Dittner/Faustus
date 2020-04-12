//
//  Book.swift
//  Faustus
//
//  Created by Alexander Dittner on 11.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class BookContent: ObservableObject {
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
}

class Book: Conspectus, ObservableObject {
    @ObservedObject var content: BookContent = BookContent()

    override var genus: ConspectusGenus { return .book }

    override var description: String {
        return "\(content.title) \(content.authorText) \(content.writtenDate)"
    }

    override var hashName: String {
        return "book" + content.title + content.writtenDate
    }

    private var disposeBag: Set<AnyCancellable> = []
    override func didInit() {
        for prop in [content.$title, content.$subTitle, content.$ISBN, content.$writtenDate, content.$publishedDate, content.$pageCount, content.$publisher, content.$place, content.$info, content.$authorText] {
            prop
                .removeDuplicates()
                .map { _ in
                    true
                }
                .assign(to: \.hasChanges, on: state)
                .store(in: &disposeBag)
        }

        content.$author
            .removeDuplicates()
            .map { _ in
                true
            }
            .assign(to: \.hasChanges, on: state)
            .store(in: &disposeBag)
    }

    override func validate() -> ValidationStatus {
        if content.title.isEmpty { return .emptyBookTitle }
        if content.writtenDate.isEmpty { return .emptyWrittenYear }
        if content.authorText.isEmpty && content.author == nil { return .emptyBookAuthor }
        return .ok
    }

    override func serialize() -> [String: Any] {
        var dict = super.serialize()
        dict["title"] = content.title
        dict["subTitle"] = content.subTitle
        dict["ISBN"] = content.ISBN
        dict["writtenDate"] = content.writtenDate
        dict["publishedDate"] = content.publishedDate
        dict["pageCount"] = content.pageCount
        dict["publisher"] = content.publisher
        dict["place"] = content.place
        dict["info"] = content.info
        dict["authorText"] = content.authorText
        if let author = content.author {
            dict["authorID"] = author.id
        }
        return dict
    }

    override func deserialize(_ bibliography: Bibliography) {
        super.deserialize(bibliography)
        if let dict = fileData {
            content.title = dict["title"] as? String ?? ""
            content.subTitle = dict["subTitle"] as? String ?? ""
            content.ISBN = dict["ISBN"] as? String ?? ""
            content.writtenDate = dict["writtenDate"] as? String ?? ""
            content.publishedDate = dict["publishedDate"] as? String ?? ""
            content.pageCount = dict["pageCount"] as? String ?? ""
            content.publisher = dict["publisher"] as? String ?? ""
            content.place = dict["place"] as? String ?? ""
            content.info = dict["info"] as? String ?? ""
            content.authorText = dict["authorText"] as? String ?? ""
            if let authorID = dict["authorID"] as? UID {
                content.author = bibliography.read(authorID) as? Author
            }
        }

        state.hasChanges = false
    }

    override func removeLinks(with conspectus: Conspectus) {
        if let author = content.author, author.id == conspectus.id {
            content.author = nil
            _ = store()
        }
    }
}
