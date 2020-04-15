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
    @Published var booksColl: BooksColl!

    func update(with booksColl: BooksColl) {
        self.booksColl = booksColl
    }

    var chooseBooksPublisher: AnyCancellable?
    func addBook() {
        chooseBooksPublisher?.cancel()
        chooseBooksPublisher = rootVM.chooseBooks(selectedBooks: booksColl.books)
            .sink { result in
                print("chooseBooks has result")
                self.booksColl.updateBooks(result)
            }
    }

    func removeBook(_ book: Book) {
        booksColl.removeBook(book)
    }
}
