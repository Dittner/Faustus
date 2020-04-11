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

                StatusBoard(conspectus: vm.selectedConspectus)
                    .zIndex(1)

                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 15) {
                        StoreStateBoard(conspectus: vm.selectedConspectus)
                        BookList(controller: vm.bookListController, title: "AUFSÄTZE")

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

                StatusBoard(conspectus: vm.selectedConspectus)
                    .zIndex(1)

                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 15) {
                        StoreStateBoard(conspectus: vm.selectedConspectus)
                        InfoPanel(conspectus: vm.selectedConspectus)
                        BookList(controller: vm.bookListController)
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

                StatusBoard(conspectus: vm.selectedConspectus)
                    .zIndex(1)

                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 15) {
                        StoreStateBoard(conspectus: vm.selectedConspectus)
                        BookInfoPanel(book: vm.selectedConspectus as! Book)

                        // QuoteCell(quote: vm.quote, isEditing: true)

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

                StatusBoard(conspectus: vm.selectedConspectus)
                    .zIndex(1)

                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 15) {
                        StoreStateBoard(conspectus: vm.selectedConspectus)
                        InfoPanel(conspectus: vm.selectedConspectus)
                        ParentTag(controller: vm.tagTreeController)

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

struct StatusBoard: View {
    @ObservedObject var conspectus: Conspectus

    init(conspectus: Conspectus) {
        self.conspectus = conspectus
        print("ValidationInfoBoard init, id: \(conspectus.id)")
    }

    var body: some View {
        VStack(alignment: .center, spacing: 0) {
            if conspectus.validationStatus == .ok {
                Color(conspectus.genus)
                    .frame(width: 30, height: 10)
                    .offset(y: 0)

                Spacer()
            } else {
                Text(conspectus.validationStatus.rawValue)
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

struct StoreStateBoard: View {
    @EnvironmentObject var vm: DocViewModel
    @ObservedObject var conspectus: Conspectus
    private let isUser: Bool

    init(conspectus: Conspectus) {
        self.conspectus = conspectus
        isUser = conspectus is User
        print("StoreInfoBoard init, id: \(conspectus.id)")
    }

    var body: some View {
        HStack(alignment: .top, spacing: 15) {
            if conspectus.isEditing || conspectus.isRemoved {
                SelectableText(text: "Löschen", color: Color.F.black05)
                    .font(Font.custom(.mono, size: 13))
                    .padding(.leading, 0)
                    .padding(.top, 0)
                    .opacity(isUser ? 0 : 1)
                    .onTapGesture {
                        if self.conspectus.isRemoved {
                            self.vm.confirmDelete()
                        } else {
                            self.vm.removeSelectedConspectus()
                        }
                    }
            }

            if conspectus.isRemoved {
                SelectableText(text: "Zurücklegen", color: Color.F.black05)
                    .font(Font.custom(.mono, size: 13))
                    .padding(.leading, 0)
                    .padding(.top, 0)
                    .onTapGesture {
                        self.conspectus.isRemoved = false
                    }
            }

            Spacer()

            Text("\(conspectus.createdDate) / \(conspectus.changedDate)")
                .lineLimit(1)
                .font(Font.custom(.mono, size: 13))
                .foregroundColor(Color.F.black05)
                .frame(alignment: .trailing)
                .padding(.trailing, 0)
        }.frame(height: 20)
            .padding(.leading, 0)
    }
}

struct Section: View {
    @Binding var isExpanded: Bool
    let title: String
    var isEditing: Bool = false
    var action: (() -> Void)?

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .center) {
                if self.isEditing && self.action != nil {
                    Button("", action: self.action!)
                        .buttonStyle(IconButtonStyle(iconName: "plus", iconColor: Color.F.white, bgColor: Color.F.black, width: 20, height: 20))
                        .offset(x: 10 - geometry.size.width / 2)
                }

                Text(self.title)
                    .lineLimit(1)
                    .font(Font.custom(.pragmaticaSemiBold, size: 21))
                    .foregroundColor(Color.F.black)
                    .padding(.leading, 0)
                    .offset(y: 3)

                Toggle("", isOn: self.$isExpanded)
                    .toggleStyle(CollapseToggleStyle())
                    .offset(x: geometry.size.width / 2 - 10)

                Separator(color: Color.F.black, width: .infinity)
                    .offset(y: 15)
            }
        }.frame(height: 40)
    }
}

struct BookList: View {
    @ObservedObject var controller: BookListController
    @ObservedObject var conspectus: Conspectus
    @State private var isExpanded: Bool = true

    private let font = NSFont(name: .pragmaticaLight, size: 21)
    private let title: String

    init(controller: BookListController, title: String = "BÜCHER") {
        self.controller = controller
        conspectus = controller.conspectus
        self.title = title
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Section(isExpanded: $isExpanded, title: title, isEditing: self.conspectus.isEditing, action: controller.addBook)

            if isExpanded {
                ForEach(controller.books, id: \.id) { book in
                    ConspectusLink(conspectus: book, isEditing: self.conspectus.isEditing, isSelected: false, action: { result in
                        switch result {
                        case .edit:
                            print("Edited link")
                        case .remove:
                            self.controller.removeBook(with: book.id)
                        case .navigate:
                            book.show()
                        }
                    })
                }.padding(.leading, 40)
                    .padding(.trailing, 20)
                    .padding(.top, 0)
            }
        }
    }
}

struct SelectableText: View {
    @State private var hover = false
    let text: String
    let color: Color

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
            TextInput(title: title, text: $text, textColor: textColor, font: font, alignment: alignment, isFocused: isFocused, isSecure: false, format: format, isEditable: true, onEnterAction: nil)
                .saturation(0)
                .padding(.horizontal, 0)
                .allowsHitTesting(isEditing)

            Separator(color: Color(textColor), width: .infinity)
                .opacity(isEditing ? 0.25 : 0)
        }
    }
}

struct QuoteCell: View {
    @ObservedObject var quote: Quote
    private static let pagesFont: NSFont = NSFont(name: .pragmaticaBold, size: 21)
    private static let textFont: NSFont = NSFont(name: .pragmaticaLight, size: 21)
    private let isEditing: Bool

    init(quote: Quote, isEditing: Bool) {
        self.quote = quote
        self.isEditing = isEditing
        print("QuoteCell quote id = \(quote.id)")
    }

    func pageInputWidthFrom(text: String, isEditing: Bool) -> CGFloat {
        return isEditing ? 70 : (CGFloat(text.count) + 0.5) * 12
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .lastTextBaseline, spacing: 0) {
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
            }.frame(height: 40)

            TextArea(text: $quote.text, textColor: NSColor.F.black, font: QuoteCell.textFont, isEditable: self.isEditing)
                .layoutPriority(-1)
                .lineSpacing(5)
                .padding(.horizontal, -4)
                .frame(height: TextArea.textHeightFrom(text: quote.text, width: 925, font: QuoteCell.textFont, isShown: true))

        }.saturation(0)
            .colorScheme(.light)
            .padding(.leading, 40)
            .padding(.trailing, 20)
            .padding(.vertical, 5)
            .background(Color.F.quoteBG)
    }
}

#if DEBUG
    struct DocView_Previews: PreviewProvider {
        static var previews: some View {
            DocView()
        }
    }
#endif
