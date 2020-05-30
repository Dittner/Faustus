//
//  LinkListViewController.swift
//  Faustus
//
//  Created by Alexander Dittner on 15.05.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class LinkListViewController: ViewModel {
    @Published var linkColl: LinkColl!
    @Published var filteredLinks: [Conspectus] = []

    var owner: Conspectus!

    func update(_ conspectus: Conspectus) {
        owner = conspectus

        linkColl = conspectus.linkColl
        filteredLinks = linkColl.links
            .filter { $0.genus != .tag }
            .sorted { $0 < $1 }
    }

    func removeLink(_ c: Conspectus) {
        linkColl.removeLink(from: c)
        filteredLinks = linkColl.links.filter { $0.genus != .tag }
    }
}
