//
//  QuoteCellController.swift
//  Faustus
//
//  Created by Alexander Dittner on 22.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class QuoteLinkChooser: ViewModel, ChooserController {
    @Published var owner: Quote!

    @Published var choosingQuote: Quote?
    @Published var selectedLink: Conspectus?
    @Published var selectedFilter: SearchFilter = .authors
    @Published var filteredLinks: [Conspectus] = []
    @Published var filterText: String = ""
    private var disposeBag: Set<AnyCancellable> = []

    init() {
        Publishers.CombineLatest3($selectedFilter, $filterText.debounce(for: 0.5, scheduler: RunLoop.main), model.bibliography.objectWillChange)
            .map { filter, filterText, conspectusList -> (SearchFilter, String, [Conspectus]) in
                (filter, filterText, conspectusList.filter { !$0.state.isRemoved && $0.genus == filter.toGenus()! })
            }
            .map { filter, filterText, conspectusList -> (SearchFilter, [Conspectus]) in
                filterText.isEmpty ? (filter, conspectusList) : (filter, conspectusList.filter { $0.description.hasSubstring(filterText) })
            }
            .map { filter, conspectusList in
                if filter == .authors {
                    return conspectusList.sorted {
                        ($0 as! Author).content.birthYear > ($1 as! Author).content.birthYear
                    }
                }

                if filter == .books {
                    return conspectusList.sorted {
                        ($0 as! Book).content.writtenDate > ($1 as! Book).content.writtenDate
                    }
                }

                if filter == .tags {
                    return conspectusList.sorted {
                        ($0 as! Tag).content.name < ($1 as! Tag).content.name
                    }
                }

                return conspectusList
            }
            .assign(to: \.filteredLinks, on: self)
            .store(in: &disposeBag)
    }

    var chooseLinkPublisher: AnyCancellable?
    func chooseLink(q: Quote) {
        choosingQuote = q
        owner = q
    }

    func cancel() {
        choosingQuote = nil
    }

    func apply() {
        choosingQuote = nil
        if let link = selectedLink {
            owner.linkColl.addLink(to: link)
        }
    }
}
