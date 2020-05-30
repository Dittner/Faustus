//
//  BookListViewController.swift
//  Faustus
//
//  Created by Alexander Dittner on 15.05.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class BookListViewController: ViewModel {
    var owner: Conspectus!

    func update(_ conspectus: Conspectus) {
        owner = conspectus
    }

    func remove(_ book: Book) {
        (owner as? BooksOwner)?.booksColl.removeBook(book)
    }
}
