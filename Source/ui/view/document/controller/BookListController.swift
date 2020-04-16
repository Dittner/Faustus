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
    @Published var bookColl: BookColl!

    func update(with booksColl: BookColl) {
        self.bookColl = booksColl
    }

    var chooseBooksPublisher: AnyCancellable?
    func addBook() {
        chooseBooksPublisher?.cancel()
        chooseBooksPublisher = rootVM.chooseBooks(selectedBooks: bookColl.books)
            .sink { result in
                print("chooseBooks has result")
                self.bookColl.updateBooks(result)
            }
    }

    func removeBook(_ book: Book) {
        bookColl.removeBook(book)
    }
}
