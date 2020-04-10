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
    @Published var books: [Conspectus] = []

    func update(conspectus: Conspectus) {
        self.conspectus = conspectus
        if let author = conspectus.asAuthor {
            books = author.books
        } else if let user = conspectus.asUser {
            books = user.books
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
                if let author = self.conspectus.asAuthor {
                    author.updateBooks(result)
                    self.books = result
                } else if let user = self.conspectus.asUser {
                    user.updateBooks(result)
                    self.books = result
                }
            }
    }

    func removeBook(with uid: UID) {
        books.removeAll { $0.id == uid }
        if let author = self.conspectus.asAuthor {
            author.updateBooks(books)
        } else if let user = self.conspectus.asUser {
            user.updateBooks(books)
        }
    }
}
