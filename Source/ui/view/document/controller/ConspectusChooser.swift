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
    case inactive
    case chooseAuthor
    case chooseBooks
    case chooseTags
    case chooseLink
    case chooseLinkAmongUserBooks
    case chooseLinkAmongUserBooksComment
    case commenting
}

class ConspectusChooser: ViewModel, ChooserController {
    @Published var owner: Conspectus!
    @Published var mode: LinkChooserMode = .inactive
    @Published var selectedFilter: SearchFilter = .authors
    @Published var filterText: String = ""
    @Published var showFilterBar: Bool = false

    @Published var searchResult: [Conspectus] = []
    @Published var allTags: [Tag] = []
    @Published var filteredTags: [Tag] = []
    var selectOnlyParentTag: Bool = false
    var tagTree: TagTree = TagTree([])

    @Published var selectedAuthor: Conspectus? // Author or User
    @Published var selectedBooks: [Book] = []
    @Published var selectedTags: [Tag] = []
    @Published var selectedParentTag: Tag?
    @Published var selectedUserBook: Book?
    @Published var selectedUserBookComment: Quote?

    @Published var userBooks: [Book] = []
    @Published var userBookComments: [Quote] = []
    @Published var userCommentText: String = "Ihr Kommentar"
    @Published var userCommentStartPage: String = ""
    @Published var userCommentEndPage: String = ""

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        Publishers.CombineLatest3($selectedFilter, $filterText.debounce(for: 0.5, scheduler: RunLoop.main), model.bibliography.objectWillChange)
            .filter { selectedFilter, _, _ in
                selectedFilter != .comments && selectedFilter != .tags
            }
            .map { filter, filterText, conspectusList -> (SearchFilter, String, [Conspectus]) in
                (filter, filterText, conspectusList.filter { !$0.state.isRemoved && $0.genus == filter.toGenus()! })
            }
            .map { filter, filterText, conspectusList -> (SearchFilter, [Conspectus]) in
                filterText.isEmpty ? (filter, conspectusList) : (filter, conspectusList.filter { $0.getDescription().hasSubstring(filterText) })
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

                return conspectusList
            }
            .assign(to: \.searchResult, on: self)
            .store(in: &disposeBag)

        Publishers.CombineLatest3($selectedFilter, $filterText.debounce(for: 0.5, scheduler: RunLoop.main), model.user.booksColl.$books)
            .filter { selectedFilter, _, _ in
                selectedFilter == .comments
            }
            .map { filter, filterText, userBooks -> (SearchFilter, [Conspectus]) in
                filterText.isEmpty ? (filter, userBooks) : (filter, userBooks.filter { $0.getDescription().hasSubstring(filterText) })
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
            .assign(to: \.userBookComments, on: self)
            .store(in: &disposeBag)

        $selectedFilter
            .removeDuplicates()
            .sink { filter in
                if filter == .comments {
                    self.mode = .chooseLinkAmongUserBooks
                    self.selectedUserBook = nil
                } else if filter == .tags, self.filteredTags.count == 0 {
                    let allTags = self.model.bibliography.getValues()
                        .filter { $0 is Tag && !$0.state.isRemoved }
                        .map { $0 as! Tag }
                        .sorted { $0 < $1 }

                    let tagTree = TagTree(allTags)
                    self.allTags = tagTree.flatTree()
                }
            }
            .store(in: &disposeBag)
    }

    //
    // BOOKS
    //

    func chooseBooks(_ author: Conspectus) {
        clear()
        owner = author
        mode = .chooseBooks
        selectedFilter = .books
    }

    //
    // AUTHOR
    //

    func chooseAuthor(_ book: Book) {
        clear()
        owner = book
        mode = .chooseAuthor
        selectedFilter = .authors
    }

    //
    // TAGS
    //

    func chooseParentTag(_ tag: Tag) {
        clear()
        owner = tag
        mode = .chooseTags
        selectedFilter = .tags
        selectOnlyParentTag = true

        selectedParentTag = tag.content.parentTag

        let allTags = model.bibliography.getValues()
            .filter { $0 is Tag && !$0.state.isRemoved }
            .map { $0 as! Tag }
            .sorted { $0 < $1 }

        let tagTree = TagTree(allTags)
        filteredTags = tagTree.flatTree { $0.id != self.owner.id }
    }

    func chooseTags(_ conspectus: Conspectus) {
        if !(conspectus is Tag || conspectus is User) {
            clear()
            owner = conspectus
            mode = .chooseTags
            selectedFilter = .tags

            let tags = model.bibliography.getValues()
                .filter { $0 is Tag && !$0.state.isRemoved }
                .map { $0 as! Tag }
                .sorted { $0 < $1 }

            tagTree = TagTree(tags)
            allTags = tagTree.flatTree()
        }
    }

    func selectDeselect(_ tag: Tag) {
        var res = selectedTags

        if selectedTags.contains(tag) {
            deselect(tag, &res)
        } else {
            select(tag, &res)
        }

        selectedTags = res
    }

    private func deselect(_ t: Tag, _ src: inout [Tag]) {
        for (ind, tag) in src.enumerated() {
            if t == tag {
                src.remove(at: ind)
                let children = src.filter { $0.content.parentTag == t }
                for childTag in children {
                    deselect(childTag, &src)
                }
            }
        }
    }

    private func select(_ t: Tag, _ src: inout [Tag]) {
        src.append(t)
        if let parentTag = t.content.parentTag, !src.contains(parentTag) {
            select(parentTag, &src)
        }
    }

    //
    // LINK
    //

    func chooseLink(_ quote: Quote) {
        clear()
        owner = quote
        mode = .chooseLink
        selectedFilter = .authors
        showFilterBar = true
    }

    private func clear() {
        owner = nil
        mode = .inactive
        selectedAuthor = nil
        selectedBooks = []
        selectedTags = []
        selectedUserBook = nil
        selectedUserBookComment = nil
        showFilterBar = false
        selectOnlyParentTag = false
        userCommentText = "Ihr Kommentar"
        filterText = ""
        filteredTags = []
    }

    func cancelCommenting() {
        selectedFilter = .comments
        selectedUserBook = nil
        mode = .chooseLinkAmongUserBooksComment
    }

    func cancel() {
        clear()
    }

    func apply() {
        switch selectedFilter {
        case .authors:
            if let book = owner as? Book {
                if let author = selectedAuthor as? Author {
                    author.booksColl.addBook(book)
                } else if let user = selectedAuthor as? User {
                    user.booksColl.addBook(book)
                }
                clear()
            } else if let quote = owner as? Quote, let author = selectedAuthor {
                quote.linkColl.addLink(to: author)
                clear()
            }
        case .books:
            if let author = owner as? Author {
                author.booksColl.updateBooks(selectedBooks)
                clear()
            } else if let quote = owner as? Quote {
                for b in selectedBooks {
                    quote.linkColl.addLink(to: b)
                }
                clear()
            }
        case .tags:
            if selectOnlyParentTag {
                (owner as! Tag).content.updateParent(with: selectedParentTag)
            } else {
                let initialTags = owner.linkColl.links.map { $0 as? Tag }.compactMap { $0 }

                for t in selectedTags {
                    if !initialTags.contains(t) {
                        owner.linkColl.addLink(to: t)
                    }
                }

                for t in initialTags {
                    if !selectedTags.contains(t) {
                        owner.linkColl.removeLink(from: t)
                    }
                }
            }
            clear()
        case .comments:
            if mode == .chooseLinkAmongUserBooksComment, let comment = selectedUserBookComment {
                owner.linkColl.addLink(to: comment)
                clear()
            } else if mode == .commenting, let quote = owner as? Quote {
                let userComment = Quote(owner: selectedUserBook!)
                userComment.text = userCommentText
                userComment.startPage = userCommentStartPage
                userComment.endPage = userCommentEndPage
                let status = userComment.validate()
                if status == .ok {
                    selectedUserBook!.quoteColl.quotes.insert(userComment, at: 0)
                    owner.linkColl.addLink(to: userComment)
                    clear()
                } else {
                    quote.book.state.validationStatus = status
                }
            }
        default:
            clear()
        }
    }
}
