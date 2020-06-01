//
//  ContentView.swift
//  Faustus
//
//  Created by Alexander Dittner on 06.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

struct DocView: View {
    @ObservedObject var vm: DocViewModel
    @ObservedObject var chooser: ConspectusChooser

    init(vm: DocViewModel) {
        self.vm = vm
        chooser = vm.chooser
    }

    var body: some View {
        VStack(alignment: .center, spacing: 0) {
            //
            // HEADER
            //

            if vm.selectedConspectus is User {
                UserHeader(user: vm.selectedConspectus as! User).frame(width: Constants.docViewAndScrollerWidth)
            } else if vm.selectedConspectus is Author {
                AuthorHeader(author: vm.selectedConspectus as! Author).frame(width: Constants.docViewAndScrollerWidth)
            } else if vm.selectedConspectus is Book {
                BookHeader(book: vm.selectedConspectus as! Book, chooser: vm.chooser).zIndex(1).frame(width: Constants.docViewAndScrollerWidth)
            } else if vm.selectedConspectus is Tag {
                TagHeader(tag: vm.selectedConspectus as! Tag, chooser: vm.chooser).frame(width: Constants.docViewAndScrollerWidth)
            }

            //
            // BODY
            //

            StatusPanel(vm.selectedConspectus)
                .padding(.horizontal, 15)
                .frame(width: Constants.docViewAndScrollerWidth)
                .zIndex(1)

            Spacer().frame(height: -30)

            StoreStatePanel(self.vm.selectedConspectus)
                .padding(.horizontal, 15)

            Spacer().frame(height: 15)

            HStack(alignment: .bottom, spacing: 0) {
                SectionTabBar(selectedSection: $vm.selectedSection, enabledSections: vm.enabledSections)

                if vm.selectedSection == .books {
                    Spacer()
                    Button("", action: {
                        self.vm.selectedConspectus.state.isEditing = true
                        self.vm.chooser.chooseBooks(self.vm.selectedConspectus)
                    })
                        .buttonStyle(IconButtonStyle(iconName: "middlePlus", iconColor: Color.F.black, bgColor: Color.F.grayBG, width: 30, height: 30))

                } else if vm.selectedSection == .tags {
                    Spacer()
                    Button("", action: {
                        self.vm.selectedConspectus.state.isEditing = true
                        self.vm.chooser.chooseTags(self.vm.selectedConspectus)
                    })
                        .buttonStyle(IconButtonStyle(iconName: "middlePlus", iconColor: Color.F.black, bgColor: Color.F.grayBG, width: 30, height: 30))
                    
                } else if vm.selectedSection == .quotes {
                    QuoteToolsView(self.vm.quoteListController, chooser: self.vm.chooser)
                } else {
                    Spacer()
                }
            }
            .padding(.leading, Constants.docViewPadding)
            .padding(.trailing, Constants.docViewScrollerWidth)
            .padding(.bottom, 2)

            Separator(color: Color.F.black, width: .infinity, height: 2)
                .padding(.horizontal, 15)

            CustomScrollView(controller: vm.scrollController) {
                VStack(alignment: .leading, spacing: 1) {
                    if self.chooser.owner == self.vm.selectedConspectus && self.chooser.mode == .chooseAuthor {
                        ConspectusChooserView(chooser: self.chooser)
                            .offset(x: Constants.docViewLeading - Constants.docViewPadding)
                    } else if self.chooser.owner == self.vm.selectedConspectus && self.chooser.mode == .chooseTags && self.chooser.selectOnlyParentTag {
                        ConspectusChooserView(chooser: self.chooser)
                            .offset(x: Constants.docViewLeading - Constants.docViewPadding)
                            .padding(.bottom, 15)
                    }
                    else if self.chooser.owner == self.vm.quoteListController.selectedQuote && self.chooser.mode == .chooseLink {
                        ConspectusChooserView(chooser: self.chooser)
                            .offset(x: Constants.docViewLeading - Constants.docViewPadding)
                    }

                    if vm.selectedSection == .info {
                        if self.vm.selectedConspectus is Book {
                            BookInfoPanel(self.vm.infoController)
                        } else if self.vm.selectedConspectus is Tag {
                            InfoPanel(self.vm.infoController)
                        } else {
                            InfoPanel(self.vm.infoController)
                        }
                    } else if vm.selectedSection == .books {
                        BookListView(self.vm.bookListViewController, chooser: self.vm.chooser)
                    } else if vm.selectedSection == .tags {
                        TagLinksView(self.vm.tagTreeController, chooser: self.vm.chooser)
                    } else if vm.selectedSection == .links {
                        LinkListView(self.vm.linkListViewController)
                    } else if vm.selectedSection == .quotes {
                        QuoteListView(self.vm.quoteListController, chooser: self.vm.chooser)
                    }
                }
                .padding(.top, 15)
                .padding(.leading, Constants.docViewPadding)
            }
        }
        .background(DocViewBG(conspectus: vm.selectedConspectus))
        .fillParent()
    }
}

enum DocViewSection: String {
    case info
    case tags
    case books
    case links
    case quotes

    func toTitle() -> String {
        switch self {
        case .info:
            return "INFO"
        case .tags:
            return "TAGS"
        case .books:
            return "BÜCHER"
        case .links:
            return "LINKS"
        case .quotes:
            return "ZITATE"
        }
    }
}

struct SectionTabBar: View {
    @Binding var selectedSection: DocViewSection
    var enabledSections: [DocViewSection] = [.info, .tags, .books, .links]

    var body: some View {
        HStack(alignment: .center, spacing: 1) {
            ForEach(enabledSections, id: \.self) { section in
                Text(section.toTitle())
                    .lineLimit(1)
                    .font(Font.custom(.pragmatica, size: 16))
                    .padding(.horizontal, 10)
                    .padding(.top, 4)
                    .frame(height: 30)
                    .foregroundColor(self.selectedSection == section ? Color.F.white : Color.F.black)
                    .background(self.selectedSection == section ? Color.F.black : Color.F.clear)
                    .cornerRadius(2)
                    .onTapGesture {
                        self.selectedSection = section
                    }
            }
        }.frame(height: 30)
    }
}

struct DocViewBG: View {
    @ObservedObject var state: ConspectusState

    init(conspectus: Conspectus) {
        state = conspectus.state
    }

    var body: some View {
        VStack(alignment: .center, spacing: 0) {
            Color(state.isRemoved ? NSColor.F.red : NSColor.F.black)
                .frame(height: 100)

            Color.F.white
        }
    }
}

struct StatusPanel: View {
    let conspectus: Conspectus
    @ObservedObject var state: ConspectusState

    init(_ conspectus: Conspectus) {
        self.conspectus = conspectus
        state = conspectus.state
        print("ValidationInfoBoard init, id: \(conspectus.id)")
    }

    var body: some View {
        VStack(alignment: .center, spacing: 0) {
            if state.validationStatus == .ok {
                Color(conspectus.genus)
                    .frame(width: 30, height: 10)
                    .offset(y: 0)

                Spacer().frame(height: 20)
            } else {
                Text(state.validationStatus.rawValue)
                    .lineLimit(1)
                    .font(Font.custom(.pragmatica, size: 21))
                    .foregroundColor(Color.F.white)
                    .padding(.leading, 0)
                    .frame(width: 600, height: 30)
                    .background(Color.F.red)
            }
        }
    }
}

struct StoreStatePanel: View {
    @EnvironmentObject var vm: DocViewModel
    @ObservedObject var state: ConspectusState
    private let isUser: Bool

    init(_ conspectus: Conspectus) {
        state = conspectus.state
        isUser = conspectus is User
        print("StoreInfoBoard init, id: \(conspectus.id)")
    }

    var body: some View {
        HStack(alignment: .top, spacing: 15) {
            if state.isEditing || state.isRemoved {
                SelectableText(text: "Löschen", color: Color.F.black05)
                    .font(Font.custom(.mono, size: 13))
                    .padding(.leading, 0)
                    .padding(.top, 0)
                    .opacity(isUser ? 0 : 1)
                    .onTapGesture {
                        if self.state.isRemoved {
                            self.vm.confirmDelete()
                        } else {
                            self.vm.removeSelectedConspectus()
                        }
                    }
            }

            if state.isRemoved {
                SelectableText(text: "Zurücklegen", color: Color.F.black05)
                    .font(Font.custom(.mono, size: 13))
                    .padding(.leading, 0)
                    .padding(.top, 0)
                    .onTapGesture {
                        self.state.isRemoved = false
                        self.state.isEditing = true
                    }
            }

            Spacer()

            Text("\(state.createdDate) / \(state.changedDate)")
                .lineLimit(1)
                .font(Font.custom(.mono, size: 13))
                .foregroundColor(Color.F.black05)
                .frame(alignment: .trailing)
                .padding(.trailing, 0)
        }.frame(height: 20)
            .padding(.leading, 0)
    }
}

struct BookListView: View {
    let owner: Conspectus
    @ObservedObject var controller: BookListViewController
    @ObservedObject var chooser: ConspectusChooser
    @ObservedObject var booksColl: BookColl
    @ObservedObject var state: ConspectusState
    private let font = NSFont(name: .pragmaticaLight, size: 21)

    init(_ controller: BookListViewController, chooser: ConspectusChooser) {
        self.controller = controller
        owner = controller.owner
        self.chooser = chooser
        booksColl = (controller.owner as! BooksOwner).booksColl
        state = controller.owner.state
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if chooser.mode == .chooseBooks {
                ConspectusChooserView(chooser: chooser)
            } else {
                ForEach(booksColl.books, id: \.id) { book in
                    ConspectusLink(conspectus: book, isEditing: self.state.isEditing, action: { result in
                        switch result {
                        case .remove:
                            self.controller.remove(book)
                        case .navigate:
                            book.show()
                        }
                    })
                }
            }
        }.padding(.leading, Constants.docViewLeading - Constants.docViewPadding)
            .padding(.trailing, 0)
            .padding(.top, 0)
    }
}

struct TagLinksView: View {
    @ObservedObject var chooser: ConspectusChooser
    @ObservedObject var controller: TagTreeController
    @ObservedObject var state: ConspectusState

    private var disposeBag: Set<AnyCancellable> = []

    init(_ controller: TagTreeController, chooser: ConspectusChooser) {
        self.chooser = chooser
        self.controller = controller
        state = controller.owner.state
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if chooser.mode == .chooseTags {
                ConspectusChooserView(chooser: chooser).offset(x: Constants.docViewLeading)
            } else {
                ForEach(controller.ownerTags, id: \.id) { tag in
                    ConspectusLink(conspectus: tag, isEditing: self.state.isEditing, action: { result in
                        if result == .navigate {
                            tag.show()
                        } else if result == .remove {
                            self.controller.removeTag(tag)
                        }
                    }).offset(x: CGFloat(tag.content.getLevel()) * 50, y: 0)

                }.padding(.leading, Constants.docViewLeading - Constants.docViewPadding)
                    .padding(.trailing, 0)
            }
        }
    }
}

struct LinkListView: View {
    @ObservedObject var controller: LinkListViewController
    @ObservedObject var state: ConspectusState

    init(_ controller: LinkListViewController) {
        self.controller = controller
        state = controller.owner.state
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            ForEach(controller.filteredLinks, id: \.id) { c in
                ConspectusLink(conspectus: c, isEditing: self.state.isEditing, action: { result in
                    if result == .navigate {
                        c.show()
                    } else if result == .remove {
                        self.controller.removeLink(c)
                    }
                }).padding(.leading, Constants.docViewLeading - Constants.docViewPadding)

            }.padding(.leading, 0)
                .padding(.trailing, 0)
        }
    }
}

struct CompactLinksSubView: View {
    @ObservedObject var state: ConspectusState
    @ObservedObject var notifier: Notifier
    let isEditing: Bool

    class Notifier: ObservableObject {
        @Published var linkColl: LinkColl!
        @Published var filteredLinks: [ConspectusWrapper] = []

        let viewHeight: CGFloat

        init(_ conspectus: Conspectus) {
            linkColl = conspectus.linkColl
            let links = conspectus.linkColl.links.filter { $0.genus != .quote }
                .sorted { $0 < $1 }

            var wrappedLinks: [ConspectusWrapper] = []
            let defLinkHeight = ConspectusLink.HEIGHT
            let defLinkWidthPadding = ConspectusLink.PADDING
            let defLinkIconBtnWidth: CGFloat = 26
            let gap: CGFloat = 12
            var curXPos: CGFloat = 0
            var curYPos: CGFloat = 0
            let viewWidth: CGFloat = Constants.docViewWidth - 80

            for (ind, link) in links.enumerated() {
                let linkWidth = 2 * defLinkWidthPadding + defLinkIconBtnWidth + CGFloat(link.getDescription(detailed: false).count) * 9.5
                if link is Book || linkWidth > viewWidth - curXPos - gap {
                    curYPos = ind == 0 ? 0 : curYPos + defLinkHeight + gap
                    wrappedLinks.append(ConspectusWrapper(conspectus: link, x: 0, y: curYPos))
                    curXPos = linkWidth + gap
                } else {
                    wrappedLinks.append(ConspectusWrapper(conspectus: link, x: curXPos.rounded(), y: curYPos))
                    curXPos = curXPos + linkWidth + gap
                }
            }

            viewHeight = CGFloat(wrappedLinks.count > 0 ? curYPos + defLinkHeight : 0)

            filteredLinks = wrappedLinks
        }

        func removeLink(_ link: ConspectusWrapper) {
            linkColl.removeLink(from: link.conspectus)
            filteredLinks.removeAll { $0.conspectus == link.conspectus }
        }
    }

    struct ConspectusWrapper {
        let conspectus: Conspectus
        let x: CGFloat
        let y: CGFloat
    }

    private var disposeBag: Set<AnyCancellable> = []

    init(_ conspectus: Conspectus, isEditing: Bool) {
        self.isEditing = isEditing
        notifier = Notifier(conspectus)
        state = conspectus.state
    }

    var body: some View {
        ZStack(alignment: .topLeading) {
            ForEach(notifier.filteredLinks, id: \.conspectus.id) { link in
                ConspectusLink(conspectus: link.conspectus, isEditing: self.isEditing, action: { result in
                    if result == .navigate {
                        link.conspectus.show()
                    } else if result == .remove {
                        self.notifier.removeLink(link)
                    }
                }).offset(x: link.x, y: link.y - self.notifier.viewHeight / 2 + 15)
            }
        }.frame(height: notifier.viewHeight)
    }
}

struct QuoteToolsView: View {
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var controller: QuoteListController
    @ObservedObject var chooser: ConspectusChooser
    @ObservedObject var state: ConspectusState

    init(_ controller: QuoteListController, chooser: ConspectusChooser) {
        self.controller = controller
        self.chooser = chooser
        state = controller.book.state
        logInfo(tag: .UI, msg: "QuoteListView init with \(controller.quotes.count)")
    }

    var body: some View {
        HStack(alignment: .bottom, spacing: 1) {
            if controller.quotes.count > 0 {
                TextInput(title: "", text: $controller.book.quoteColl.selectedQuoteIndex, textColor: NSColor.F.black, font: NSFont(name: .pragmatica, size: 21), alignment: .right, isFocused: false, isSecure: false, format: "[0-9]{0,5}", isEditable: true, onEnterAction: nil)
                    .frame(width: 175)
                    .saturation(0)
                    .colorScheme(.light)

                Text("/ \(controller.quotes.count)")
                    .font(Font.custom(.pragmatica, size: 21))
                    .foregroundColor(Color.F.black)
                    .frame(width: 70, alignment: .topLeading)
            }

            Spacer()

            if self.controller.filterEnabled {
                TextInput(title: "", text: $controller.book.quotesFilter, textColor: NSColor.F.black, font: NSFont(name: .pragmatica, size: 21), alignment: .left, isFocused: self.textFocus.id == .quoteSearch, isSecure: false, format: nil, isEditable: true, onEnterAction: nil)
                    .frame(width: 150, alignment: .leading)
                    .padding(.horizontal, 0)
                    .saturation(0)
                    .colorScheme(.light)
                    .background(Separator(color: Color.F.black, width: 150).offset(x: 0, y: 13))
            }

            Button("", action: {
                self.controller.filterEnabled.toggle()
                if self.controller.filterEnabled {
                    self.textFocus.id = .quoteSearch
                } else {
                    self.controller.book.quotesFilter = ""
                }
            })
                .buttonStyle(IconButtonStyle(iconName: "middleSearch", iconColor: Color.F.black, bgColor: Color.F.grayBG, width: 30, height: 30))

            Button("", action: {
                self.state.isEditing = true
                self.controller.createQuote()
            })
                .buttonStyle(IconButtonStyle(iconName: "middlePlus", iconColor: Color.F.black, bgColor: Color.F.grayBG, width: 30, height: 30))

            if state.isEditing {
                Button("", action: { self.controller.formatQuoteText(self.controller.selectedQuote!) })
                    .buttonStyle(IconButtonStyle(iconName: "format", iconColor: Color.F.black, bgColor: Color.F.grayBG, width: 30, height: 30))

                Button("", action: { self.chooser.chooseLink(self.controller.selectedQuote!) })
                    .buttonStyle(IconButtonStyle(iconName: "link", iconColor: Color.F.black, bgColor: Color.F.grayBG, width: 30, height: 30))

                Button("", action: { self.controller.removeQuote(self.controller.selectedQuote!) })
                    .buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: Color.F.grayBG, width: 30, height: 30))
            }
        }
        .frame(height: 30)
    }
}

struct QuoteListView: View {
    @ObservedObject var controller: QuoteListController
    @ObservedObject var chooser: ConspectusChooser
    @ObservedObject var state: ConspectusState

    init(_ controller: QuoteListController, chooser: ConspectusChooser) {
        self.controller = controller
        self.chooser = chooser
        state = controller.book.state
        logInfo(tag: .UI, msg: "QuoteListView init with \(controller.quotes.count)")
    }

    var body: some View {
        VStack(alignment: .trailing, spacing: 0) {
            SelectableText(text: "ZURÜCK", color: Color.F.book)
                .font(Font.custom(.mono, size: 16))
                .padding(.leading, 0)
                .padding(.trailing, Constants.quoteTextTrailing)
                .frame(height: 30)
                .opacity(controller.isSelectedQuoteFirst() ? 0 : 1)
                .onTapGesture {
                    self.controller.showPrevQuote()
                }

            if controller.selectedQuote != nil {
                HStack(alignment: .center, spacing: 0) {
                    CompactLinksSubView(controller.selectedQuote!, isEditing: self.state.isEditing)
                    Spacer()
                }.padding(.bottom, 10)

                QuoteCell(quote: controller.selectedQuote!, isEditing: self.state.isEditing, chooser: self.chooser, quoteListController: self.controller)
            }

            Spacer()

            SelectableText(text: "WEITER", color: Color.F.book)
                .font(Font.custom(.mono, size: 16))
                .padding(.trailing, 0)
                .padding(.trailing, Constants.quoteTextTrailing)
                .frame(height: 30)
                .opacity(controller.isSelectedQuoteLast() ? 0 : 1)
                .onTapGesture {
                    self.controller.showNextQuote()
                }
        }
    }
}

struct QuoteCell: View {
    @ObservedObject var quote: Quote
    @ObservedObject var quoteLinkColl: LinkColl
    @ObservedObject var chooser: ConspectusChooser
    @ObservedObject var quoteListController: QuoteListController

    static let titleFont: Font = Font.custom(.pragmaticaLightItalics, size: 18)
    static let nsTitleFont: NSFont = NSFont(name: .pragmaticaLightItalics, size: 18)
    static var nsTextFont: NSFont = NSFont(name: .georgia, size: 21)
    static var textFont: Font = Font.custom(.georgia, size: 21)

    private let isEditing: Bool

    init(quote: Quote, isEditing: Bool, chooser: ConspectusChooser, quoteListController: QuoteListController) {
        self.quote = quote
        quoteLinkColl = quote.linkColl
        self.isEditing = isEditing
        self.chooser = chooser
        self.quoteListController = quoteListController
        // print("QuoteCell quote id = \(quote.id)")
    }

    func pageInputWidthFrom(text: String, isEditing: Bool) -> CGFloat {
        return isEditing ? 70 : (CGFloat(text.count) + 0.5) * 12
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .bottom, spacing: 0) {
                if !isEditing {
                    Text("S. " + quote.startPage + (quote.endPage.count > 0 ? "–\(quote.endPage)" : ""))
                        .font(QuoteCell.titleFont)
                        .foregroundColor(Color.F.black05)
                        .frame(height: 30)

                    Spacer()

                    Text(quote.title)
                        .font(QuoteCell.titleFont)
                        .foregroundColor(Color.F.black05)
                        .frame(height: 30)

                } else {
                    Text("S.")
                        .font(QuoteCell.titleFont)
                        .foregroundColor(Color.F.black05)
                        .frame(height: 30)

                    EditableText("", text: $quote.startPage, textColor: NSColor.F.black05, font: QuoteCell.nsTitleFont, alignment: .right, isEditing: isEditing, format: "[1-9][0-9]{0,4}")
                        .saturation(0)
                        .frame(width: pageInputWidthFrom(text: quote.startPage, isEditing: isEditing), height: 30)

                    Text("–")
                        .font(QuoteCell.titleFont)
                        .foregroundColor(Color.F.black05)
                        .opacity($quote.endPage.wrappedValue.count == 0 && !isEditing ? 0 : 1)
                        .frame(height: 30)

                    EditableText("", text: $quote.endPage, textColor: NSColor.F.black05, font: QuoteCell.nsTitleFont, alignment: .left, isEditing: isEditing, format: "[1-9][0-9]{0,4}")
                        .saturation(0)
                        .frame(width: 70, height: 30)

                    Spacer()

                    EditableText("Titel", text: $quote.title, textColor: NSColor.F.black05, font: QuoteCell.nsTitleFont, alignment: .right, isEditing: isEditing)
                        .saturation(0)
                        .frame(width: 500, height: 30)
                }
            }.padding(.bottom, 30)

            MultilineInput(text: $quote.text, width: Constants.docViewWidth - Constants.docViewLeading - Constants.quoteTextTrailing, textColor: NSColor.F.black, font: QuoteCell.nsTextFont, isEditing: self.isEditing, highlightedText: quoteListController.searchText, firstLineHeadIndent: 50)

            // user comments
            if quoteLinkColl.links.count > 0 {
                ForEach(quoteLinkColl.links.filter { $0 is Quote }, id: \.id) { c in
                    ConspectusLink(conspectus: c, isEditing: self.isEditing, action: { result in
                        if result == .navigate {
                            c.show()
                        } else if result == .remove {
                            self.quote.linkColl.removeLink(from: c)
                        }
                    })
                }
            }
        }
        .colorScheme(.light)
        .padding(.leading, Constants.docViewLeading - Constants.docViewPadding)
        .padding(.trailing, Constants.quoteTextTrailing)
        .padding(.vertical, 10)
        .background(quote.isValid ? Color.F.whiteBG : Color.F.redBG)
    }
}

struct SelectableText: View {
    @State private var hover = false
    let text: String
    let color: Color
    var action: (() -> Void)?
    var body: some View {
        Text(text)
            .underline(hover, color: color)
            .lineLimit(1)
            .foregroundColor(color)
            .onHover { value in self.hover = value }
    }
}

struct EditableText: View {
    @Binding var text: String
    private let isEditing: Bool
    private let title: String
    private let format: String?
    private let isFocused: Bool
    private let textColor: NSColor
    private let font: NSFont
    private let alignment: NSTextAlignment

    init(_ title: String, text: Binding<String>, textColor: NSColor, font: NSFont, alignment: NSTextAlignment, isEditing: Bool, isFocused: Bool = false, format: String? = nil) {
        self.title = title
        _text = text
        self.isEditing = isEditing
        self.textColor = textColor
        self.font = font
        self.alignment = alignment
        self.format = format
        self.isFocused = isFocused
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            TextInput(title: title, text: $text, textColor: textColor, font: font, alignment: alignment, isFocused: isFocused, isSecure: false, format: format, isEditable: isEditing, onEnterAction: nil)
                .saturation(0)
                .padding(.horizontal, 0)
                .allowsHitTesting(isEditing)

            Separator(color: Color(textColor), width: .infinity)
                .opacity(isEditing ? 0.25 : 0)
        }
    }
}
