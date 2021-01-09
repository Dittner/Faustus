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
    @Published var fullTitle: String = ""
    @Published var subTitle: String = ""
    @Published var ISBN: String = ""
    @Published var writtenDate: String = ""
    @Published var publishedDate: String = ""
    @Published var pageCount: String = ""
    @Published var publisher: String = ""
    @Published var place: String = ""
    @Published var reference: String = ""
    @Published var info: String = ""
    @Published var authorText: String = ""
    @Published var author: Conspectus?

    func getAuthorFullName() -> String? {
        return authorText.isEmpty ? author?.getDescription(detailed: false) : authorText
    }
}

class BookColl: ObservableObject {
    var owner: Conspectus!
    @Published var books: [Book] = []

    func updateBooks(_ coll: [Book]) {
        for b in coll {
            if !books.contains(b) {
                b.content.author = owner
                b.store()
            }
        }

        for b in books {
            if !coll.contains(b) {
                b.content.author = nil
                b.store()
            }
        }

        books = coll.sorted { $0 > $1 }
        owner.store(forced: true)
    }

    func removeBook(_ bookToRemove: Book) {
        bookToRemove.content.author = nil
        bookToRemove.store()

        for (ind, book) in books.enumerated() {
            if book == bookToRemove {
                books.remove(at: ind)
                owner.store(forced: true)
                break
            }
        }
    }

    func removeAllBooks() {
        if books.count > 0 {
            for book in books {
                book.content.author = nil
                book.store()
            }
            books = []
            owner.store(forced: true)
        }
    }

    func addBook(_ b: Book) {
        if !books.contains(b) {
            books.append(b)
            if b.content.author != owner {
                b.content.author = owner
                b.store()
            }
            books = books.sorted { $0 > $1 }
            owner.store(forced: true)
        }
    }
}

class QuoteColl: ObservableObject {
    var owner: Book!
    @Published var quotes: [Quote] = []
    @Published var selectedQuoteIndex: Int = 0

    func removeQuote(_ quoteToRemove: Quote) {
        for (ind, quote) in quotes.enumerated() {
            if quote == quoteToRemove {
                let q = quotes.remove(at: ind)
                q.linkColl.removeAllLinks()
                owner.store(forced: true)
                break
            }
        }
    }
    
    func selectQuote(_ q: Quote) {
        for (ind, quote) in quotes.enumerated() {
            if quote == q {
                selectedQuoteIndex = ind
                break
            }
        }
    }

    func removeAllQuotes() {
        if quotes.count > 0 {
            for q in quotes {
                q.remove()
            }
            quotes = []
            owner.store(forced: true)
        }
    }

    private var lastCreatedQuote: Quote?
    func createQuote() {
        let q = Quote(owner: owner)
        q.title = lastCreatedQuote?.title ?? (quotes.count > 0 ? quotes[quotes.count - 1].title : "")
        lastCreatedQuote = q
        quotes.insert(q, at: 0)
    }
}

class Book: Conspectus, ObservableObject {
    @ObservedObject var content: BookContent = BookContent()
    @ObservedObject var quoteColl: QuoteColl = QuoteColl()
    @Published var quotesFilter: String = ""

    override var genus: ConspectusGenus { return .book }

    private var disposeBag: Set<AnyCancellable> = []
    override func didInit() {
        quoteColl.owner = self

        for prop in [content.$title, content.$fullTitle, content.$subTitle, content.$ISBN, content.$writtenDate, content.$publishedDate, content.$pageCount, content.$publisher, content.$reference, content.$place, content.$info, content.$authorText] {
            prop
                .removeDuplicates()
                .sink { _ in
                    self.state.markAsChanged()
                }
                .store(in: &disposeBag)
        }

        content.$author
            .removeDuplicates()
            .sink { author in
                if self.content.authorText.isEmpty {
                    if let a = author as? Author {
                        self.content.authorText = "\(a.content.surname) \(a.content.name)"
                    } else if let u = author as? User {
                        self.content.authorText = "\(u.content.surname) \(u.content.name)"
                    }
                }
                self.state.markAsChanged()
            }
            .store(in: &disposeBag)
    }

    override func getDescription(detailed: Bool = true) -> String {
        if let authorInfo = content.getAuthorFullName() {
            return "\(content.title), \(authorInfo), \(content.writtenDate)"
        } else {
            return "\(content.title), \(content.writtenDate)"
        }
    }

    override func getHashName() -> String {
        return "book" + content.title + content.writtenDate
    }

    override func validate() -> ValidationStatus {
        let conspectusValidation = super.validate()
        if conspectusValidation != .ok {
            state.validationStatus = conspectusValidation
        } else if content.title.isEmpty {
            state.validationStatus = .emptyBookTitle
        } else if content.writtenDate.isEmpty {
            state.validationStatus = .emptyWrittenYear
        } else if content.authorText.isEmpty && content.author == nil {
            state.validationStatus = .emptyBookAuthor
        } else if quoteColl.quotes.count > 0 {
            var status: ValidationStatus = .ok
            for q in quoteColl.quotes {
                status = q.validate()
                if status != .ok {
                    break
                }
            }
            state.validationStatus = status
        } else {
            state.validationStatus = .ok
        }

        return state.validationStatus
    }

    override func serialize() -> [String: Any] {
        var dict = super.serialize()
        dict["title"] = content.title
        dict["fullTitle"] = content.fullTitle
        dict["subTitle"] = content.subTitle
        dict["ISBN"] = content.ISBN
        dict["writtenDate"] = content.writtenDate
        dict["publishedDate"] = content.publishedDate
        dict["pageCount"] = content.pageCount
        dict["publisher"] = content.publisher
        dict["reference"] = content.reference
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

    override func deserialize() {
        super.deserialize()
        if let dict = fileData {
            content.title = dict["title"] as? String ?? ""
            content.fullTitle = dict["fullTitle"] as? String ?? ""
            content.subTitle = dict["subTitle"] as? String ?? ""
            content.ISBN = dict["ISBN"] as? String ?? ""
            content.writtenDate = dict["writtenDate"] as? String ?? ""
            content.publishedDate = dict["publishedDate"] as? String ?? ""
            content.pageCount = dict["pageCount"] as? String ?? ""
            content.publisher = dict["publisher"] as? String ?? ""
            content.reference = dict["reference"] as? String ?? ""
            content.place = dict["place"] as? String ?? ""
            content.info = dict["info"] as? String ?? ""
            content.authorText = dict["authorText"] as? String ?? ""

            if let quotes = dict["quotes"] as? [[String: Any]] {
                var res: [Quote] = []
                for quoteData in quotes {
                    res.append(Quote(owner: self, fileData: quoteData))
                }
                quoteColl.quotes = res.sorted { $0 < $1 }
            }
        }
    }

    override func deserializeLinkedFiles() {
        super.deserializeLinkedFiles()
        if let dict = fileData {
            if let authorID = dict["authorID"] as? UID {
                content.author = bibliography.read(authorID)
            }
        }

        state.markAsNotChanged()
    }

    override func destroy() {
        super.destroy()
        if let author = content.author as? BooksOwner {
            author.booksColl.removeBook(self)
        }
        quoteColl.removeAllQuotes()
    }
}
