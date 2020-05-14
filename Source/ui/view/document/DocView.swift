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

    private let statusPanelHeight: CGFloat = 30

    init(vm: DocViewModel) {
        self.vm = vm
        chooser = vm.chooser
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            //
            // HEADER
            //

            if vm.selectedConspectus is User {
                UserHeader(user: vm.selectedConspectus as! User).frame(width: 1000)
            } else if vm.selectedConspectus is Author {
                AuthorHeader(author: vm.selectedConspectus as! Author).frame(width: 1000)
            } else if vm.selectedConspectus is Book {
                BookHeader(book: vm.selectedConspectus as! Book, chooser: vm.chooser).zIndex(1).frame(width: 1000)
            } else if vm.selectedConspectus is Tag {
                TagHeader(tag: vm.selectedConspectus as! Tag, chooser: vm.chooser).frame(width: 1000)
            }

            StatusPanel(vm.selectedConspectus)
                .frame(width: 1000)
                .zIndex(1)

            //
            // BODY
            //

            CustomScrollView(controller: vm.scrollController, vm: vm) {
                VStack(alignment: .leading, spacing: 15) {
                    StoreStatePanel(self.vm.selectedConspectus)
                    if self.vm.selectedConspectus is User {
                        BookListView(self.vm.bookListViewController, chooser: self.vm.chooser, title: "AUFSÄTZE")
                    } else if self.vm.selectedConspectus is Author {
                        InfoPanel(self.vm.infoController)
                        TagLinksView(self.vm.tagTreeController, chooser: self.vm.chooser)
                        BookListView(self.vm.bookListViewController, chooser: self.vm.chooser)
                        LinkListView(self.vm.linkListViewController)
                    } else if self.vm.selectedConspectus is Book {
                        if chooser.owner == self.vm.selectedConspectus && chooser.mode == .chooseAuthor {
                            ConspectusChooserView(chooser: chooser).offset(x: Constants.docViewLeading)
                        }
                        BookInfoPanel(self.vm.infoController)
                        TagLinksView(self.vm.tagTreeController, chooser: self.vm.chooser)
                        LinkListView(self.vm.linkListViewController)
                        QuoteListView(self.vm.quoteListController, chooser: self.vm.chooser, changeInputsWithText: false)
                    } else if self.vm.selectedConspectus is Tag {
                        if chooser.owner == self.vm.selectedConspectus && chooser.mode == .chooseTags && chooser.selectOnlyParentTag {
                            ConspectusChooserView(chooser: chooser).offset(x: Constants.docViewLeading)
                        }
                        InfoPanel(self.vm.infoController)
                        LinkListView(self.vm.linkListViewController)
                    }
                }
                .padding(.horizontal, 15)
            }
            .offset(x: 0, y: -statusPanelHeight)

            Spacer()
                .frame(height: -statusPanelHeight)
        }
        .background(DocViewBG(conspectus: vm.selectedConspectus))
        .fillParent()
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

struct SectionView: View {
    @Binding var isExpanded: Bool
    let title: String
    var isEditing: Bool = false
    var action: (() -> Void)?
    let actionBtnIcon: String = "plus"

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .center) {
                if self.isEditing && self.action != nil {
                    Button("", action: self.action!)
                        .buttonStyle(IconButtonStyle(iconName: self.actionBtnIcon, iconColor: Color.F.black, bgColor: Color.F.white, width: 20, height: 20))
                        .offset(x: 10 - geometry.size.width / 2)
                }

                Text(self.title)
                    .lineLimit(1)
                    .font(Font.custom(.pragmaticaSemiBold, size: 21))
                    .foregroundColor(Color.F.black)
                    .padding(.leading, 0)
                    .offset(y: 3)

                Button(action: {
                    self.isExpanded.toggle()
                }) {
                    RoundedRectangle(cornerRadius: 2)
                        .foregroundColor(self.isExpanded ? Color.F.black : Color.F.clear)

                    Image("dropdown")
                        .renderingMode(.template)
                        .foregroundColor(self.isExpanded ? Color.F.white : Color.F.black)
                        .rotationEffect(Angle(degrees: self.isExpanded ? 0 : -90))
                        .allowsHitTesting(false)
                }.buttonStyle(PlainButtonStyle())
                    .frame(width: 20, height: 20)
                    .offset(x: geometry.size.width / 2 - 10)

                Separator(color: Color.F.black, width: .infinity)
                    .offset(y: 15)
            }
        }.frame(height: 40).padding(.bottom, 8)
    }
}

struct BookListView: View {
    let owner: Conspectus
    @ObservedObject var controller: BookListViewController
    @ObservedObject var chooser: ConspectusChooser
    @ObservedObject var booksColl: BookColl
    @ObservedObject var state: ConspectusState
    private let font = NSFont(name: .pragmaticaLight, size: 21)
    private let title: String

    init(_ controller: BookListViewController, chooser: ConspectusChooser, title: String = "BÜCHER") {
        self.controller = controller
        owner = controller.owner
        self.title = title
        self.chooser = chooser
        booksColl = (controller.owner as! BooksOwner).booksColl
        state = controller.owner.state
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            SectionView(isExpanded: $controller.isExpanded, title: title, isEditing: self.state.isEditing, action: { self.chooser.chooseBooks(self.owner) })

            if controller.isExpanded || chooser.mode == .chooseBooks {
                if chooser.mode == .chooseBooks {
                    ConspectusChooserView(chooser: chooser)
                } else {
                    ForEach(booksColl.books, id: \.id) { book in
                        ConspectusLink(conspectus: book, isEditing: self.state.isEditing, action: { result in
                            switch result {
                            case .remove:
                                self.booksColl.removeBook(book)
                            case .navigate:
                                book.show()
                            }
                        })
                    }.padding(.leading, Constants.docViewLeading)
                        .padding(.trailing, 0)
                        .padding(.top, 0)
                }
            }
        }
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
        VStack(alignment: .leading, spacing: 1) {
            SectionView(isExpanded: $controller.isExpanded, title: "TAGS", isEditing: self.state.isEditing, action: { self.chooser.chooseTags(self.controller.owner) })

            if controller.isExpanded || chooser.mode == .chooseTags {
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
                        }).offset(x: CGFloat(tag.content.getLevel()) * Constants.docViewLeading, y: 0)

                    }.padding(.leading, Constants.docViewLeading)
                        .padding(.trailing, 0)
                }
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
            SectionView(isExpanded: $controller.isExpanded, title: "LINKS", isEditing: self.state.isEditing)

            if controller.isExpanded {
                ForEach(controller.filteredLinks, id: \.id) { c in
                    ConspectusLink(conspectus: c, isEditing: self.state.isEditing, action: { result in
                        if result == .navigate {
                            c.show()
                        } else if result == .remove {
                            self.controller.removeLink(c)
                        }
                    }).padding(.leading, Constants.docViewLeading)

                }.padding(.leading, 0)
                    .padding(.trailing, 0)
            }
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
            let viewWidth: CGFloat = 920

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

struct QuoteListView: View {
    @ObservedObject var controller: QuoteListController
    @ObservedObject var chooser: ConspectusChooser
    @ObservedObject var state: ConspectusState

    let changeInputsWithText: Bool

    init(_ controller: QuoteListController, chooser: ConspectusChooser, changeInputsWithText: Bool = false) {
        self.controller = controller
        self.chooser = chooser
        self.changeInputsWithText = changeInputsWithText
        state = controller.book.state
        print("QuoteListView init")
    }

    var body: some View {
        VStack(alignment: .center, spacing: 15) {
            SectionView(isExpanded: $controller.isExpanded, title: "ZITATE", isEditing: self.state.isEditing, action: controller.createQuote)

            if controller.isExpanded {
                HStack(alignment: .lastTextBaseline, spacing: 0) {
                    Image("search")
                        .renderingMode(.template)
                        .foregroundColor(Color.F.black)
                        .frame(width: 60)

                    TextInput(title: "", text: $controller.book.quotesFilter, textColor: NSColor.F.black, font: NSFont(name: .pragmaticaLight, size: 21), alignment: .left, isFocused: false, isSecure: false, format: nil, isEditable: true, onEnterAction: nil)
                        .frame(width: 300, height: 50, alignment: .leading)
                        .padding(.horizontal, 0)
                        .saturation(0)
                        .colorScheme(.light)
                        .background(Separator(color: Color.F.black, width: 300).offset(x: 0, y: 15))

                    Spacer()
                }
                .frame(height: 50)

                ForEach(controller.quotes, id: \.id) { q in
                    QuoteCell(quote: q, isEditing: self.state.isEditing, chooser: self.chooser, quoteListController: self.controller, changeInputsWithText: self.changeInputsWithText)
                }.padding(.leading, 0)
                    .padding(.trailing, 0)

                Spacer().frame(width: 0)
            }
        }
    }
}

struct QuoteCell: View {
    @ObservedObject var quote: Quote
    @ObservedObject var quoteLinkColl: LinkColl
    @ObservedObject var chooser: ConspectusChooser
    @ObservedObject var quoteListController: QuoteListController
    let changeInputsWithText: Bool

    static let pagesFont: NSFont = NSFont(name: .pragmaticaBold, size: 21)
    static var nsTextFont: NSFont = NSFont(name: .pragmaticaLight, size: 24)
    static var textFont: Font = Font.custom(.pragmaticaLight, size: 24)

    private let isEditing: Bool

    init(quote: Quote, isEditing: Bool, chooser: ConspectusChooser, quoteListController: QuoteListController, changeInputsWithText: Bool) {
        self.quote = quote
        quoteLinkColl = quote.linkColl
        self.isEditing = isEditing
        self.chooser = chooser
        self.quoteListController = quoteListController
        self.changeInputsWithText = changeInputsWithText
        print("QuoteCell quote id = \(quote.id)")
    }

    func pageInputWidthFrom(text: String, isEditing: Bool) -> CGFloat {
        return isEditing ? 70 : (CGFloat(text.count) + 0.5) * 12
    }

    static var bgTextFont: Font = Font.custom(.pragmaticaLight, size: 13.5)
    func replace(_ str: String, searchText: String) -> String {
        str.replacingOccurrences(of: searchText, with: "█", options: .caseInsensitive)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            HStack(alignment: .top, spacing: 0) {
                if changeInputsWithText {
                    Text("S. \(quote.startPage)–\(quote.endPage)")
                        .font(Font.custom(.pragmaticaBold, size: 21))
                        .foregroundColor(Color.F.black)
                } else {
                    Text("S.")
                        .font(Font.custom(.pragmaticaBold, size: 21))
                        .foregroundColor(Color.F.black)

                    EditableText("", text: $quote.startPage, textColor: NSColor.F.black, font: QuoteCell.pagesFont, alignment: .right, isEditing: isEditing, format: "[1-9][0-9]{0,4}")
                        .saturation(0)
                        .frame(width: pageInputWidthFrom(text: quote.startPage, isEditing: isEditing))

                    Text("–")
                        .font(Font.custom(.pragmaticaBold, size: 21))
                        .foregroundColor(Color.F.black)
                        .opacity($quote.endPage.wrappedValue.count == 0 && !isEditing ? 0 : 1)

                    EditableText("", text: $quote.endPage, textColor: NSColor.F.black, font: QuoteCell.pagesFont, alignment: .left, isEditing: isEditing, format: "[1-9][0-9]{0,4}")
                        .saturation(0)
                        .frame(width: 70)
                }

                Spacer()

                if isEditing {
                    Button("", action: { self.quoteListController.formatQuoteText(self.quote) })
                        .buttonStyle(IconButtonStyle(iconName: "format", iconColor: Color.F.black, bgColor: quote.isValid ? Color.F.whiteBG : Color.F.redBG, width: 30, height: 30))
                        .offset(y: -10)
                        .opacity(isEditing ? 1 : 0)

                    Button("", action: { self.chooser.chooseLink(self.quote) })
                        .buttonStyle(IconButtonStyle(iconName: "link", iconColor: Color.F.black, bgColor: quote.isValid ? Color.F.whiteBG : Color.F.redBG, width: 30, height: 30))
                        .offset(y: -10)
                        .opacity(isEditing ? 1 : 0)

                    Button("", action: { self.quoteListController.removeQuote(self.quote) })
                        .buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: quote.isValid ? Color.F.whiteBG : Color.F.redBG, width: 30, height: 30))
                        .offset(y: -10)
                        .opacity(isEditing ? 1 : 0)
                }
            }.frame(height: 40)

            CompactLinksSubView(quote, isEditing: self.isEditing)

            if changeInputsWithText {
                Text(self.replace(quote.text, searchText: self.quoteListController.searchText))
                    .lineSpacing(9)
                    .font(QuoteCell.textFont)
                    .multilineTextAlignment(.leading)
                    .frame(width: 905, alignment: .leading)
                    .foregroundColor(Color.F.black)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.top, 12)
                    .allowsHitTesting(false)

                Spacer()
            } else {
                TextArea(text: $quote.text, textColor: NSColor.F.black, font: QuoteCell.nsTextFont, isEditable: self.isEditing, highlightedText: quoteListController.searchText)
                    .layoutPriority(-1)
                    .padding(.top, 5)
                    .padding(.bottom, 10)
                    .padding(.leading, -5)
                    .offset(y: 0)
                    .saturation(0)
                    .frame(height: TextArea.textHeightFrom(text: quote.text, width: 905, font: QuoteCell.nsTextFont, isShown: true) + 15)
                    .onTapGesture(count: 2) {
                        if !self.isEditing {
                            notify(msg: "in die Zwischenablage kopiert")
                            let pasteBoard = NSPasteboard.general
                            pasteBoard.clearContents()
                            pasteBoard.setString(self.quote.text, forType: .string)
                        }
                    }
            }

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

            if chooser.owner == quote && isEditing {
                ConspectusChooserView(chooser: chooser)
            }
        }
        .colorScheme(.light)
        .padding(.leading, Constants.docViewLeading)
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
