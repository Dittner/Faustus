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

    var body: some View {
        VStack(alignment: .center, spacing: 0) {
            if vm.selectedConspectus == nil {
                Color.F.black.frame(height: 100)
                Color.F.white
            } else if vm.selectedConspectus!.asAuthor != nil {
                AuthorHeader(conspectus: vm.selectedConspectus!)
                    .background(Color.F.black)

                ValidationStatusBoard(conspectus: vm.selectedConspectus!)
                    .frame(height: 30)
                    .zIndex(1)

                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 21) {
                        Spacer()
                            .frame(height: 20)

                        InfoPanel(conspectus: vm.selectedConspectus!)
                        BooksPanel(conspectus: vm.selectedConspectus!)

                        // QuoteCell(quote: vm.quote, isEditing: true)

                    }.padding(.leading, 20)
                }
                .offset(x: 0, y: -30)

                Spacer()
                    .frame(height: -30)
            }
        }
        .background(Color.F.white)
        .fillParent()
    }
}

struct ValidationStatusBoard: View {
    @ObservedObject var conspectus: Conspectus

    init(conspectus: Conspectus) {
        self.conspectus = conspectus
        print("ValidationStatusBoard init, author: \(conspectus.id)")
    }

    var body: some View {
        VStack(alignment: .center) {
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
                    .frame(width: 1000, height: 30)
                    .background(Color.F.invalid)
            }
        }
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

                Toggle("", isOn: self.$isExpanded)
                    .toggleStyle(CollapseToggleStyle())
                    .offset(x: geometry.size.width / 2 - 12)

                Separator(color: Color.F.black, width: .infinity)
                    .offset(y: 15)
            }.frame(height: 20)
        }
    }
}

struct InfoPanel: View {
    class Notifier: ObservableObject {
        @Published var info = ""
    }

    @ObservedObject private var notifier = Notifier()
    @ObservedObject var conspectus: Conspectus
    @State private var isExpanded: Bool = true

    private let font = NSFont(name: .pragmaticaLight, size: 21)
    private var disposeBag: Set<AnyCancellable> = []

    init(conspectus: Conspectus) {
        self.conspectus = conspectus

        if let author = conspectus.asAuthor {
            notifier.info = author.info
            notifier.$info
                .sink { value in
                    author.info = value
                }
                .store(in: &disposeBag)
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Section(isExpanded: $isExpanded, title: "Info")
                .frame(height: 20)

            TextArea(text: $notifier.info, textColor: NSColor.F.black, font: font, isEditable: conspectus.isEditing)
                .layoutPriority(-1)
                .saturation(0)
                .colorScheme(.light)
                .padding(.leading, 40)
                .padding(.trailing, 20)
                // .padding(.vertical, 5)
                .frame(height: TextArea.textHeightFrom(text: notifier.info, width: 925, font: font, isShown: isExpanded))
                .opacity(isExpanded ? 1 : 0)
        }
    }
}

struct BooksPanel: View {
    @ObservedObject var conspectus: Conspectus
    @State private var isExpanded: Bool = true

    private let font = NSFont(name: .pragmaticaLight, size: 21)
    private var disposeBag: Set<AnyCancellable> = []
    private var books = ["1. Also sprach Zarathustra, 1885", "2. Der Antichrist, 1888", "3. Ecce Homo, 1888"]

    init(conspectus: Conspectus) {
        self.conspectus = conspectus
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Section(isExpanded: $isExpanded, title: "Books")
                .frame(height: 20)

            Spacer().frame(height: 10)

            ForEach(books, id: \.self) { book in
                SelectableLink(text: book)
                    .frame(height: 30)
            }.padding(.leading, 40)
                .padding(.trailing, 20)
                .frame(maxHeight: self.isExpanded ? nil : 0)
                .opacity(isExpanded ? 1 : 0)
        }
    }
}

struct SelectableLink: View {
    @State private var hover = false
    let text: String

    var body: some View {
        Text(text)
            .underline(hover, color: Color.F.black)
            .lineLimit(1)
            .font(Font.custom(.pragmaticaLightItalics, size: 21))
            .foregroundColor(Color.F.black)
            .frame(height: 30)
            .onHover { _ in self.hover.toggle() }
    }
}

struct AuthorHeader: View {
    enum AuthorHeaderInput {
        case no
        case name
        case surname
        case birthYear
        case deathYear
    }

    @ObservedObject var author: Author
    @ObservedObject var conspectus: Conspectus
    @State private var focusedInput: AuthorHeaderInput = .no

    init(conspectus: Conspectus) {
        self.conspectus = conspectus
        author = conspectus.asAuthor!
        author = author
        if conspectus.isEditing {
            focusedInput = .name
        }
        print("AuthorHeader init, author: \(author.id), has changes: \(author.hasChanges)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .lastTextBaseline, spacing: 10) {
                Button("") {
                    print("button pressed!")
                }.buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: Color.F.white))

                Spacer().frame(width: 10)

                TextInput(title: "Vorname", text: $author.name, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 30), alignment: .right, isFocused: focusedInput == .name, isSecure: false, format: nil, isEditable: conspectus.isEditing, onEnterAction: { self.focusedInput = .surname })
                    .saturation(0)

                TextInput(title: "Nachname", text: $author.surname, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaBold, size: 30), alignment: .left, isFocused: focusedInput == .surname, isSecure: false, format: nil, isEditable: conspectus.isEditing, onEnterAction: { self.focusedInput = .birthYear })
                    .saturation(0)

                Toggle("", isOn: $conspectus.isEditing)
                    .toggleStyle(RoundToggleStyle(onColor: Color.F.author))
            }
            .offset(x: 0, y: 14)
            .padding(.horizontal, 10)
            .frame(height: 50)

            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Image("changed")
                    .renderingMode(.template)
                    .allowsHitTesting(false)
                    .foregroundColor(Color.F.white)
                    .frame(width: 30, height: 30)
                    .opacity(author.hasChanges ? 1 : 0)

                Spacer()

                TextInput(title: "geboren", text: $author.birthYear, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 16), alignment: .right, isFocused: focusedInput == .birthYear, isSecure: false, format: "-?[0-9]{0,4}", isEditable: conspectus.isEditing, onEnterAction: { self.focusedInput = .deathYear })
                    .saturation(0)
                    .frame(width: 100)

                Text("–")
                    .font(Font.custom(.pragmaticaExtraLight, size: 16))
                    .foregroundColor(Color.F.white)
                    .frame(width: 10, alignment: .center)
                    .opacity($author.deathYear.wrappedValue.count == 0 ? 0.25 : 1)

                TextInput(title: "gestorben", text: $author.deathYear, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 16), alignment: .left, isFocused: focusedInput == .deathYear, isSecure: false, format: "-?[0-9]{0,4}", isEditable: conspectus.isEditing, onEnterAction: { self.focusedInput = .name })
                    .saturation(0)
                    .frame(width: 100)

                Spacer()

                Spacer().frame(width: 30, height: 30)
            }
            .padding(.horizontal, 10)
            .frame(height: 50)
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
                .padding(.horizontal, -4)
                .frame(height: TextArea.textHeightFrom(text: quote.text, width: 925, font: QuoteCell.textFont, isShown: true))

        }.saturation(0)
            .colorScheme(.light)
            .padding(.leading, 40)
            .padding(.trailing, 20)
            .padding(.vertical, 5)
            .background(Color.F.quoteBg)
    }
}

#if DEBUG
    struct DocView_Previews: PreviewProvider {
        static var previews: some View {
            DocView()
        }
    }
#endif
