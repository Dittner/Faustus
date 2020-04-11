//
//  BookListController.swift
//  Faustus
//
//  Created by Alexander Dittner on 08.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class BookListController: ViewModel {
    @Published var conspectus: Conspectus!
    @Published var books: [Book] = []

    func update(conspectus: Conspectus) {
        self.conspectus = conspectus
        if let author = conspectus as? Author {
            books = author.content.books
        } else if let user = conspectus as? User {
            books = user.content.books
        } else {
            books = []
        }
    }

    var chooseBooksPublisher: AnyCancellable?
    func addBook() {
        chooseBooksPublisher?.cancel()
        chooseBooksPublisher = rootVM.chooseBooks(selectedBooks: books)
            .sink { result in
                print("chooseBooks has result")
                if let author = self.conspectus as? Author {
                    author.updateBooks(result)
                    self.books = result
                } else if let user = self.conspectus as? User {
                    user.updateBooks(result)
                    self.books = result
                }
            }
    }

    func removeBook(with uid: UID) {
        books.removeAll { $0.id == uid }
        if let author = self.conspectus as? Author {
            author.updateBooks(books)
        } else if let user = self.conspectus as? User {
            user.updateBooks(books)
        }
    }
}
