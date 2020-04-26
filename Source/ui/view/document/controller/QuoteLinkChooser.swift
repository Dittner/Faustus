//
//  QuoteCellController.swift
//  Faustus
//
//  Created by Alexander Dittner on 22.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

enum LinkChooserMode {
    case choosingConspectus
    case choosingUserBooks
    case choosingUserBooksComments
    case commenting
}

class QuoteLinkChooser: ViewModel, ChooserController {
    @Published var owner: Quote!
    @Published var choosingMode: LinkChooserMode = .choosingConspectus
    @Published var selectedLink: Conspectus?
    @Published var userBooks: [Book] = []
    @Published var selectedUserBook: Book?
    @Published var selectedUserBookComments: [Quote] = []
    @Published var userCommentText: String = "Ihr Kommentar"
    @Published var userCommentStartPage: String = ""
    @Published var userCommentEndPage: String = ""
    @Published var selectedFilter: SearchFilter = .authors
    @Published var searchResult: [Conspectus] = []
    @Published var filterText: String = ""
    private var disposeBag: Set<AnyCancellable> = []

    init() {
        Publishers.CombineLatest3($selectedFilter, $filterText.debounce(for: 0.5, scheduler: RunLoop.main), model.bibliography.objectWillChange)
            .filter { selectedFilter, _, _ in
                selectedFilter != .comments
            }
            .map { filter, filterText, conspectusList -> (SearchFilter, String, [Conspectus]) in
                (filter, filterText, conspectusList.filter { !$0.state.isRemoved && $0.genus == filter.toGenus()! })
            }
            .map { filter, filterText, conspectusList -> (SearchFilter, [Conspectus]) in
                filterText.isEmpty ? (filter, conspectusList) : (filter, conspectusList.filter { $0.description.hasSubstring(filterText) })
            }
            .map { filter, conspectusList in
                if filter == .authors {
                    return conspectusList.sorted {
                        ($0 as! Author).content.name < ($1 as! Author).content.name
                    }
                }

                if filter == .books {
                    return conspectusList.sorted {
                        ($0 as! Book).content.title < ($1 as! Book).content.title
                    }
                }

                if filter == .tags {
                    return conspectusList.sorted {
                        ($0 as! Tag).content.name < ($1 as! Tag).content.name
                    }
                }

                return conspectusList
            }
            .assign(to: \.searchResult, on: self)
            .store(in: &disposeBag)

        Publishers.CombineLatest3($selectedFilter, $filterText.debounce(for: 0.5, scheduler: RunLoop.main), model.user.booksColl.$books)
            .filter { selectedFilter, _, _ in
                selectedFilter == .comments
            }
            .map { filter, filterText, userBooks -> (SearchFilter, [Conspectus]) in
                filterText.isEmpty ? (filter, userBooks) : (filter, userBooks.filter { $0.description.hasSubstring(filterText) })
            }
            .map { _, userBooks in
                userBooks.map { $0 as! Book }.sorted {
                    $0.content.title < $1.content.title
                }
            }
            .assign(to: \.userBooks, on: self)
            .store(in: &disposeBag)

        $selectedUserBook
            .filter { $0 != nil }
            .map { book in
                book!.quoteColl.quotes.sorted { $0 > $1 }
            }
            .assign(to: \.selectedUserBookComments, on: self)
            .store(in: &disposeBag)

        $selectedFilter
            .removeDuplicates()
            .sink { filter in
                if filter == .comments {
                    self.choosingMode = .choosingUserBooks
                    self.selectedUserBook = nil
                } else {
                    self.choosingMode = .choosingConspectus
                }
            }
            .store(in: &disposeBag)
    }

    var chooseLinkPublisher: AnyCancellable?
    func chooseLink(q: Quote) {
        clear()
        owner = q
    }

    private func clear() {
        owner = nil
        choosingMode = .choosingConspectus
        selectedLink = nil
        selectedUserBook = nil
        userCommentText = "Ihr Kommentar"
        filterText = ""
        selectedFilter = .authors
    }

    func cancelCommenting() {
        selectedFilter = .comments
        self.selectedUserBook = nil
        choosingMode = .choosingUserBooksComments
    }

    func cancel() {
        clear()
    }

    func apply() {
        if choosingMode == .commenting {
            let q = Quote(owner: selectedUserBook!)
            q.text = userCommentText
            q.startPage = userCommentStartPage
            q.endPage = userCommentEndPage
            let status = q.validate()
            if status == .ok {
                selectedUserBook!.quoteColl.quotes.insert(q, at: 0)
                owner.linkColl.addLink(to: q)
                clear()
            } else {
                owner.book.state.validationStatus = status
            }
        }
        else if let link = selectedLink {
            owner.linkColl.addLink(to: link)
            clear()
        }
    }
}
