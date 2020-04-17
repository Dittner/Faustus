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
    @EnvironmentObject var vm: DocViewModel

    private let validationInfoBoardHeight: CGFloat = 30

    var body: some View {
        VStack(alignment: .center, spacing: 0) {
            //
            // USER
            //

            if vm.selectedConspectus is User {
                UserHeader(user: vm.selectedConspectus as! User, onClosed: vm.close)

                StatusPanel(conspectus: vm.selectedConspectus)
                    .zIndex(1)

                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 15) {
                        StoreStatePanel(conspectus: vm.selectedConspectus)
                        BookListView(controller: vm.bookListController, title: "AUFSÄTZE")
                    }.padding(.leading, 15)
                }
                .offset(x: 0, y: -validationInfoBoardHeight)

                Spacer()
                    .frame(height: -validationInfoBoardHeight)
            }

            //
            // AUTHOR
            //

            else if vm.selectedConspectus is Author {
                AuthorHeader(author: vm.selectedConspectus as! Author, onClosed: vm.close)

                StatusPanel(conspectus: vm.selectedConspectus)
                    .zIndex(1)

                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 15) {
                        StoreStatePanel(conspectus: vm.selectedConspectus)
                        InfoPanel(conspectus: vm.selectedConspectus)
                        TagLinksView(controller: vm.tagTreeController)
                        BookListView(controller: vm.bookListController)
                        LinkListView(controller: vm.linkListController)
                    }.padding(.leading, 15)
                }
                .offset(x: 0, y: -validationInfoBoardHeight)

                Spacer()
                    .frame(height: -validationInfoBoardHeight)
            }

            //
            // BOOK
            //

            else if vm.selectedConspectus is Book {
                BookHeader(book: vm.selectedConspectus as! Book, onClosed: vm.close)

                StatusPanel(conspectus: vm.selectedConspectus)
                    .zIndex(1)

                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 15) {
                        StoreStatePanel(conspectus: vm.selectedConspectus)
                        BookInfoPanel(book: vm.selectedConspectus as! Book)
                        TagLinksView(controller: vm.tagTreeController)
                        LinkListView(controller: vm.linkListController)
                        QuoteListView(controller: vm.quoteListController)

                    }.padding(.leading, 15)
                }
                .offset(x: 0, y: -validationInfoBoardHeight)

                Spacer()
                    .frame(height: -validationInfoBoardHeight)
            }

            //
            // TAG
            //

            else if vm.selectedConspectus is Tag {
                TagHeader(tag: vm.selectedConspectus as! Tag, onClosed: vm.close)

                StatusPanel(conspectus: vm.selectedConspectus)
                    .zIndex(1)

                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 15) {
                        StoreStatePanel(conspectus: vm.selectedConspectus)
                        InfoPanel(conspectus: vm.selectedConspectus)
                        LinkListView(controller: vm.linkListController)

                    }.padding(.leading, 15)
                }
                .offset(x: 0, y: -validationInfoBoardHeight)

                Spacer()
                    .frame(height: -validationInfoBoardHeight)
            }
        }
        .background(Color.F.white)
        .fillParent()
    }
}

struct StatusPanel: View {
    let conspectus: Conspectus
    @ObservedObject var state: ConspectusState

    init(conspectus: Conspectus) {
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

                Spacer()
            } else {
                Text(state.validationStatus.rawValue)
                    .lineLimit(1)
                    .font(Font.custom(.pragmatica, size: 21))
                    .foregroundColor(Color.F.white)
                    .padding(.leading, 0)
                    .frame(width: 600, height: 30)
                    .background(Color.F.red)
            }
        }.frame(height: 30)
    }
}

struct StoreStatePanel: View {
    @EnvironmentObject var vm: DocViewModel
    @ObservedObject var state: ConspectusState
    private let isUser: Bool

    init(conspectus: Conspectus) {
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
    var onExpand: ((_ isExpanded: Bool) -> Void)?
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
                    self.onExpand?(self.isExpanded)
                }) {
                    RoundedRectangle(cornerRadius: 2)
                        .foregroundColor(self.isExpanded ? Color.F.black : Color.F.clear)

                    Image("dropdown")
                        .renderingMode(.template)
                        .foregroundColor(self.isExpanded ? Color.F.white : Color.F.black)
                        .rotationEffect(Angle(degrees: self.isExpanded ? 0 : -90))
                }.buttonStyle(PlainButtonStyle())
                    .frame(width: 20, height: 20)
                    .offset(x: geometry.size.width / 2 - 10)

                Separator(color: Color.F.black, width: .infinity)
                    .offset(y: 15)
            }
        }.frame(height: 40)
    }
}

struct BookListView: View {
    @ObservedObject var controller: BookListController
    @ObservedObject var booksColl: BookColl
    @ObservedObject var state: ConspectusState
    @State private var isExpanded: Bool = BookListView.isExpanded
    static var isExpanded: Bool = true
    private let font = NSFont(name: .pragmaticaLight, size: 21)
    private let title: String

    init(controller: BookListController, title: String = "BÜCHER") {
        self.title = title
        self.controller = controller
        booksColl = controller.bookColl
        state = controller.bookColl.owner.state
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            SectionView(isExpanded: $isExpanded, title: title, isEditing: self.state.isEditing, action: controller.addBook, onExpand: { value in BookListView.isExpanded = value
            })

            if isExpanded {
                ForEach(booksColl.books, id: \.id) { book in
                    ConspectusLink(conspectus: book, isEditing: self.state.isEditing, action: { result in
                        switch result {
                        case .remove:
                            self.controller.removeBook(book)
                        case .navigate:
                            book.show()
                        }
                    })
                }.padding(.leading, 40)
                    .padding(.trailing, 0)
                    .padding(.top, 0)
            }
        }
    }
}

struct TagLinksView: View {
    @ObservedObject var controller: TagTreeController
    @ObservedObject var state: ConspectusState

    @State private var isExpanded: Bool = TagLinksView.isExpanded
    static var isExpanded: Bool = false

    private var disposeBag: Set<AnyCancellable> = []

    init(controller: TagTreeController) {
        self.controller = controller
        state = controller.owner.state
        isExpanded = TagLinksView.isExpanded
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            SectionView(isExpanded: $isExpanded, title: "TAGS", isEditing: self.state.isEditing, action: controller.chooseTags, onExpand: { value in TagLinksView.isExpanded = value
            })

            if isExpanded {
                ForEach(controller.tagNodes, id: \.tag.id) { node in
                    ConspectusLink(conspectus: node.tag, isEditing: self.state.isEditing, action: { result in
                        if result == .navigate {
                            node.tag.show()
                        } else if result == .remove {
                            self.controller.removeTag(node.tag)
                        }
                    }).offset(x: CGFloat(node.level * 40), y: 0)

                }.padding(.leading, 40)
                    .padding(.trailing, 0)
            }
        }.onDisappear { TagLinksView.isExpanded = self.isExpanded }
    }
}

struct LinkListView: View {
    @ObservedObject var controller: LinkListController
    @ObservedObject var state: ConspectusState

    @State private var isExpanded: Bool = LinkListView.isExpanded
    static var isExpanded: Bool = false
    private var disposeBag: Set<AnyCancellable> = []

    init(controller: LinkListController) {
        self.controller = controller
        state = controller.linkColl.owner.state
        isExpanded = LinkListView.isExpanded
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            SectionView(isExpanded: $isExpanded, title: "LINKS", isEditing: self.state.isEditing, onExpand: { value in LinkListView.isExpanded = value
            })

            if isExpanded {
                ForEach(controller.filteredLinks, id: \.id) { c in
                    ConspectusLink(conspectus: c, isEditing: self.state.isEditing, showDetails: true, action: { result in
                        if result == .navigate {
                            c.show()
                        } else if result == .remove {
                            self.controller.removeLink(c)
                        }
                    })

                }.padding(.leading, 0)
                    .padding(.trailing, 0)
            }
        }.onDisappear { LinkListView.isExpanded = self.isExpanded }
    }
}

struct QuoteListView: View {
    @ObservedObject var controller: QuoteListController
    @ObservedObject var state: ConspectusState

    @State private var isExpanded: Bool = QuoteListView.isExpanded
    static var isExpanded: Bool = true

    init(controller: QuoteListController) {
        self.controller = controller
        state = controller.book.state
        isExpanded = QuoteListView.isExpanded
        print("QuoteListView init")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            SectionView(isExpanded: $isExpanded, title: "ZITATE", isEditing: self.state.isEditing, action: controller.createQuote, onExpand: { value in QuoteListView.isExpanded = value
            })

            if isExpanded {
                ForEach(controller.quotes, id: \.id) { q in
                    QuoteCell(quote: q, isEditing: self.state.isEditing, onRemove: {
                        self.controller.removeQuote(q)
                    })
                }.padding(.leading, 0)
                    .padding(.trailing, 0)
            }
        }.onDisappear { QuoteListView.isExpanded = self.isExpanded }
    }
}

struct QuoteCell: View {
    @ObservedObject var quote: Quote
    private static let pagesFont: NSFont = NSFont(name: .pragmaticaBold, size: 21)
    private static let textFont: NSFont = NSFont(name: .pragmaticaLight, size: 21)
    private let isEditing: Bool
    let onRemoveAction: (() -> Void)?

    init(quote: Quote, isEditing: Bool, onRemove: (() -> Void)?) {
        self.quote = quote
        self.isEditing = isEditing
        onRemoveAction = onRemove
        print("QuoteCell quote id = \(quote.id)")
    }

    func pageInputWidthFrom(text: String, isEditing: Bool) -> CGFloat {
        return isEditing ? 70 : (CGFloat(text.count) + 0.5) * 12
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .top, spacing: 0) {
                Text("S.")
                    .font(Font.custom(.pragmaticaBold, size: 21))
                    .foregroundColor(Color.F.black)

                EditableText("", text: $quote.startPage, textColor: NSColor.F.black, font: QuoteCell.pagesFont, alignment: .right, isEditing: isEditing, format: "[1-9][0-9]{0,4}")
                    .frame(width: pageInputWidthFrom(text: quote.startPage, isEditing: isEditing))

                Text("–")
                    .font(Font.custom(.pragmaticaBold, size: 21))
                    .foregroundColor(Color.F.black)
                    .opacity($quote.endPage.wrappedValue.count == 0 && !isEditing ? 0 : 1)

                EditableText("", text: $quote.endPage, textColor: NSColor.F.black, font: QuoteCell.pagesFont, alignment: .left, isEditing: isEditing, format: "[1-9][0-9]{0,4}")
                    .frame(width: 70)

                Spacer()

                if isEditing {
                    Button("", action: { self.onRemoveAction?() })
                        .buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: Color.F.quoteBG, width: 25, height: 25))
                        .offset(y: -5)
                        .opacity(isEditing ? 1 : 0)
                }
            }.frame(height: 40)

            TextArea(text: $quote.text, textColor: NSColor.F.black, font: QuoteCell.textFont, isEditable: self.isEditing)
                .layoutPriority(-1)
                .lineSpacing(5)
                .padding(.horizontal, -4)
                .padding(.trailing, 20)
                .frame(height: TextArea.textHeightFrom(text: quote.text, width: 925, font: QuoteCell.textFont, isShown: true))
                .onTapGesture(count: 2) {
                    if !self.isEditing {
                        notify(msg: "in die Zwischenablage kopiert")
                        let pasteBoard = NSPasteboard.general
                        pasteBoard.clearContents()
                        pasteBoard.setString(self.quote.text, forType: .string)
                    }
                }

        }.saturation(0)
            .colorScheme(.light)
            .padding(.leading, 40)
            .padding(.vertical, 0)
            .background(quote.isValid ? Color.F.quoteBG : Color.F.red.opacity(0.05))
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
            .onTapGesture {
                self.action?()
            }
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
