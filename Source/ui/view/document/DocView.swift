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
    @ObservedObject private var vm = DocViewModel()
    private let validationInfoBoardHeight: CGFloat = 30

    var body: some View {
        VStack(alignment: .center, spacing: 0) {
            if vm.selectedConspectus == nil {
                Color.F.black.frame(height: 100)
                Color.F.white
            } else if vm.selectedConspectus!.asUser != nil {
                UserHeader(conspectus: vm.selectedConspectus!, onClosed: vm.close)
                    .background(Color.F.black)

                ValidationInfoBoard(conspectus: vm.selectedConspectus!)
                    .zIndex(1)

                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 15) {
                        StoreInfoBoard(conspectus: vm.selectedConspectus!)
                        BooksPanel(conspectus: vm.selectedConspectus!, title: "AUFSÄTZE")

                    }.padding(.leading, 15)
                        .padding(.top, 3)
                }
                .offset(x: 0, y: -validationInfoBoardHeight)

                Spacer()
                    .frame(height: -validationInfoBoardHeight)

            } else if vm.selectedConspectus!.asAuthor != nil {
                AuthorHeader(conspectus: vm.selectedConspectus!, onClosed: vm.close)
                    .background(Color.F.black)

                ValidationInfoBoard(conspectus: vm.selectedConspectus!)
                    .zIndex(1)

                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 15) {
                        StoreInfoBoard(conspectus: vm.selectedConspectus!)
                        InfoPanel(conspectus: vm.selectedConspectus!)
                        BooksPanel(conspectus: vm.selectedConspectus!)
                    }.padding(.leading, 15)
                        .padding(.top, 3)
                }
                .offset(x: 0, y: -validationInfoBoardHeight)

                Spacer()
                    .frame(height: -validationInfoBoardHeight)
            }
            
            else if vm.selectedConspectus!.asBook != nil {
                BookHeader(conspectus: vm.selectedConspectus!, onClosed: vm.close)
                    .background(Color.F.black)

                ValidationInfoBoard(conspectus: vm.selectedConspectus!)
                    .zIndex(1)

                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 15) {
                        StoreInfoBoard(conspectus: vm.selectedConspectus!)
                        BookInfoPanel(conspectus: vm.selectedConspectus!)

                        // QuoteCell(quote: vm.quote, isEditing: true)

                    }.padding(.leading, 15)
                        .padding(.top, 3)
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

struct ValidationInfoBoard: View {
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
                    .background(Color.F.invalid)
            }
        }.frame(height: 30)
    }
}

struct StoreInfoBoard: View {
    @ObservedObject var conspectus: Conspectus
    private let isUser: Bool

    init(conspectus: Conspectus) {
        self.conspectus = conspectus
        isUser = conspectus.genus == .asUser
        print("StoreInfoBoard init, id: \(conspectus.id)")
    }

    var body: some View {
        HStack(alignment: .top, spacing: 0) {
            SelectableText(text: "Entfernen", color: Color.F.black05)
                .font(Font.custom(.mono, size: 13))
                .padding(.leading, 0)
                .padding(.top, 0)
                .frame(width: 200, alignment: .leading)
                .opacity(conspectus.isEditing && !isUser ? 1 : 0)

            Spacer().frame(height: 30)

            Text("Erstellt: \(conspectus.createdDate)\nGeändert: \(conspectus.changedDate)")
                .lineLimit(2)
                .font(Font.custom(.mono, size: 13))
                .foregroundColor(Color.F.black05)
                .frame(width: 200, alignment: .trailing)
                .padding(.trailing, 0)
                .frame(width: 200)
        }.frame(height: 30)
            .padding(.leading, 0)
    }
}

struct Section: View {
    @Binding var isExpanded: Bool
    let title: String

    var body: some View {
        return GeometryReader { geometry in
            ZStack(alignment: .center) {
                Text(self.title)
                    .lineLimit(1)
                    .font(Font.custom(.pragmaticaSemiBold, size: 21))
                    .foregroundColor(Color.F.black)
                    .padding(.leading, 0)
                    .offset(y: 3)

                Toggle("", isOn: self.$isExpanded)
                    .toggleStyle(CollapseToggleStyle())
                    .offset(x: geometry.size.width / 2 - 12)

                Separator(color: Color.F.black, width: .infinity)
                    .offset(y: 15)
            }.frame(height: 20)
        }
    }
}



struct BooksPanel: View {
    @ObservedObject var conspectus: Conspectus
    @State private var isExpanded: Bool = true

    private let font = NSFont(name: .pragmaticaLight, size: 21)
    private let title: String
    private var disposeBag: Set<AnyCancellable> = []
    private var books = ["1. Also sprach Zarathustra, 1885", "2. Der Antichrist, 1888", "3. Ecce Homo, 1888"]

    init(conspectus: Conspectus, title: String = "BÜCHER") {
        self.conspectus = conspectus
        self.title = title
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Section(isExpanded: $isExpanded, title: title)
                .frame(height: 20)

            Spacer().frame(height: 10)

            ForEach(books, id: \.self) { book in
                SelectableText(text: book, color: Color.F.black)
                    .frame(height: 35)
                    .font(Font.custom(.pragmaticaLightItalics, size: 21))
            }.padding(.leading, 40)
                .padding(.trailing, 20)
                .frame(maxHeight: self.isExpanded ? nil : 0)
                .opacity(isExpanded ? 1 : 0)
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
                .opacity(isEditing ? 1 : 0)
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
