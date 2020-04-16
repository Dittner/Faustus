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

class BookColl: ObservableObject {
    var owner: Conspectus!
    @Published var books: [Book] = []

    func updateBooks(_ coll: [Book]) {
        for b in coll {
            if !books.contains(b) {
                b.content.author = owner
                _ = b.store()
            }
        }

        for b in books {
            if !coll.contains(b) {
                b.content.author = nil
                _ = b.store()
            }
        }

        books = coll
        _ = owner.store(forced: true)
    }

    func removeBook(_ bookToRemove: Book) {
        for (ind, book) in books.enumerated() {
            if book == bookToRemove {
                let b = books.remove(at: ind)
                b.content.author = nil
                _ = b.store()

                _ = owner.store(forced: true)

                break
            }
        }
    }

    func addBook(_ b: Book) {
        if !books.contains(b) {
            books.append(b)
            if b.content.author != owner {
                b.content.author = owner
                _ = b.store()
            }
            owner.state.markAsChanged()
            _ = owner.store()
        }
    }
}

class QuoteColl: ObservableObject {
    var owner: Book!
    @Published var quotes: [Quote] = []

    func removeQuote(_ quoteToRemove: Quote) {
        for (ind, quote) in quotes.enumerated() {
            if quote == quoteToRemove {
                let g = quotes.remove(at: ind)
                // q.linkColl.removeAllLinks()

                _ = owner.store(forced: true)

                break
            }
        }
    }

    func createQuote() {
        quotes.insert(Quote(book: owner), at: 0)
    }
}

class Book: Conspectus, ObservableObject {
    @ObservedObject var content: BookContent = BookContent()
    @ObservedObject var quoteColl: QuoteColl = QuoteColl()

    override var genus: ConspectusGenus { return .book }

    override var description: String {
        return "\(content.title) \(content.authorText) \(content.writtenDate)"
    }

    override var hashName: String {
        return "book" + content.title + content.writtenDate
    }

    private var disposeBag: Set<AnyCancellable> = []
    override func didInit() {
        quoteColl.owner = self

        for prop in [content.$title, content.$subTitle, content.$ISBN, content.$writtenDate, content.$publishedDate, content.$pageCount, content.$publisher, content.$place, content.$info, content.$authorText] {
            prop
                .removeDuplicates()
                .sink { _ in
                    self.state.markAsChanged()
                }
                .store(in: &disposeBag)
        }

        content.$author
            .removeDuplicates()
            .sink { _ in
                self.state.markAsChanged()
            }
            .store(in: &disposeBag)
    }

    override func validate() -> ValidationStatus {
        let conspectusValidation = super.validate()
        if conspectusValidation != .ok { return conspectusValidation }
        if content.title.isEmpty { return .emptyBookTitle }
        if content.writtenDate.isEmpty { return .emptyWrittenYear }
        if content.authorText.isEmpty && content.author == nil { return .emptyBookAuthor }
        if quoteColl.quotes.count > 0 {
            for q in quoteColl.quotes {
                if !q.isValid {
                    return .invalidQuote
                }
            }
        }
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

        if quoteColl.quotes.count > 0 {
            var quotes: [[String: Any]] = []
            for q in quoteColl.quotes {
                quotes.append(q.serialize())
            }
            dict["quotes"] = quotes
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

            if let quotes = dict["quotes"] as? [[String: Any]] {
                var res: [Quote] = []
                for quoteData in quotes {
                    res.append(Quote(book: self).deserialize(quoteData))
                }
                quoteColl.quotes = res.sorted { $0 < $1 }
            }
        }

        state.markAsNotChanged()
    }

    override func didDestroy(_ conspectus: Conspectus) {
        super.didDestroy(conspectus)
        if let author = content.author, author.id == conspectus.id {
            content.author = nil
            _ = store()
        }
    }
}
