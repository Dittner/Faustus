//
//  LinkListController.swift
//  Faustus
//
//  Created by Alexander Dittner on 15.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class LinkListController: ViewModel {
    @Published var linkColl: LinkColl!
    @Published var filteredLinks: [Conspectus] = []

    func update(with linkColl: LinkColl) {
        self.linkColl = linkColl
        filteredLinks = linkColl.links.filter { !($0 is Tag) }
    }

    var chooseBooksPublisher: AnyCancellable?
    func addLink() {
//        chooseBooksPublisher?.cancel()
//        chooseBooksPublisher = rootVM.chooseBooks(selectedBooks: booksColl.books)
//            .sink { result in
//                print("chooseBooks has result")
//                self.booksColl.updateBooks(result)
//            }
        filteredLinks = linkColl.links.filter { !($0 is Tag) }
    }

    func removeLink(_ c: Conspectus) {
        linkColl.removeLink(from: c)
        filteredLinks = linkColl.links.filter { !($0 is Tag) }
    }
}
