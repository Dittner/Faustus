//
//  DocView+Info.swift
//  Faustus
//
//  Created by Alexander Dittner on 03.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

struct InfoPanel: View {
    class Notifier: ObservableObject {
        @Published var info = ""
    }

    @EnvironmentObject var modalViewObservable: ModalViewObservable
    @ObservedObject private var notifier: Notifier
    @ObservedObject var state: ConspectusState
    @State private var isExpanded: Bool = true

    private let font = NSFont(name: .pragmaticaLight, size: 21)
    private let title: String
    private var disposeBag: Set<AnyCancellable> = []

    init(conspectus: Conspectus, title: String = "INFO") {
        self.state = conspectus.state
        self.title = title
        notifier = Notifier()

        if let author = conspectus as? Author {
            notifier.info = author.content.info
            notifier.$info
                .sink { value in
                    author.content.info = value
                }
                .store(in: &disposeBag)
        } else if let tag = conspectus as? Tag {
            notifier.info = tag.content.info
            notifier.$info
                .sink { value in
                    tag.content.info = value
                }
                .store(in: &disposeBag)
        }

        print("InfoPanel init, id: \(conspectus.id)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Section(isExpanded: $isExpanded, title: title)

            if self.isExpanded {
                TextArea(text: $notifier.info, textColor: NSColor.F.black, font: font, isEditable: state.isEditing && !modalViewObservable.isShown)
                    .layoutPriority(-1)
                    .saturation(0)
                    .colorScheme(.light)
                    .padding(.leading, 35)
                    .padding(.trailing, 20)
                    .background(state.isEditing ? Color.F.inputBG : Color.F.white)
                    .frame(height: TextArea.textHeightFrom(text: notifier.info, width: 925, font: font, isShown: isExpanded))
            }
        }
    }
}

struct BookInfoPanel: View {
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var book: Book
    @ObservedObject var state: ConspectusState
    @State private var isExpanded: Bool = true

    private let font = NSFont(name: .pragmaticaLight, size: 18)
    private let title: String
    private var disposeBag: Set<AnyCancellable> = []

    init(book: Book, title: String = "INFO") {
        self.book = book
        self.state = book.state
        self.title = title

        print("BookInfoPanel init, id: \(book.id)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Section(isExpanded: $isExpanded, title: title)

            if self.isExpanded {
                VStack(alignment: .leading, spacing: 5) {
                    FormInput(title: "TITEL", text: $book.content.title, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoTitle, onEnter: { self.textFocus.id = .bookInfoSubtitle })
                    FormInput(title: "UNTERTITEL", text: $book.content.subTitle, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoSubtitle, onEnter: { self.textFocus.id = .bookInfoAuthor })
                    FormInput(title: "AUTHOR", text: $book.content.authorText, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoAuthor, onEnter: { self.textFocus.id = .bookInfoIsbn })
                    FormInput(title: "ISBN", text: $book.content.ISBN, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoIsbn, onEnter: { self.textFocus.id = .bookInfoWritten })
                    FormInput(title: "GESCHRIEBEN", text: $book.content.writtenDate, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoWritten, onEnter: { self.textFocus.id = .bookInfoPublishDate })
                    FormInput(title: "ERSCHEINUNGSJAHR", text: $book.content.publishedDate, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoPublishDate, onEnter: { self.textFocus.id = .bookInfoPagesCount })
                    FormInput(title: "SEITENZAHL", text: $book.content.pageCount, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoPagesCount, onEnter: { self.textFocus.id = .bookInfoPublisher })
                    FormInput(title: "VERLAG", text: $book.content.publisher, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoPublisher, onEnter: { self.textFocus.id = .bookInfoPlace })
                    FormInput(title: "ORT", text: $book.content.place, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoPlace, onEnter: { self.textFocus.id = .bookInfoTitle })
                }

                HStack(alignment: .top, spacing: 0) {
                    Text("INHALTSANGABE")
                        .font(Font.custom(.pragmaticaSemiBold, size: 18))
                        .foregroundColor(Color.F.black)
                        .padding(.trailing, 5)
                        .frame(width: 295, height: 30, alignment: .trailing)
                        .background(Color.F.inputBG)

                    TextArea(text: $book.content.info, textColor: NSColor.F.black, font: font, isEditable: state.isEditing)
                        .layoutPriority(-1)
                        .saturation(0)
                        .colorScheme(.light)
                        .offset(x: 0, y: -1)
                        .padding(.leading, 3)
                        .padding(.trailing, 5)
                        .background(state.isEditing ? Color.F.inputBG : Color.F.white)
                        .frame(height: TextArea.textHeightFrom(text: book.content.info, width: 670, font: font, isShown: isExpanded))
                }
            }
        }
    }
}

struct FormInput: View {
    public let title: String
    @Binding var text: String
    public let isEditing: Bool
    public let isFocused: Bool
    public let onEnter: (() -> Void)?
    public let titleWidth: CGFloat = 300

    var body: some View {
        return GeometryReader { geometry in
            ZStack(alignment: .topLeading) {
                Text(self.title)
                    .font(Font.custom(.pragmaticaSemiBold, size: 18))
                    .foregroundColor(Color.F.black)
                    .padding(.trailing, 5)
                    .frame(width: self.titleWidth - 5, height: 30, alignment: .trailing)
                    .background(Color.F.inputBG)

                TextInput(title: "", text: self.$text, textColor: NSColor.F.black, font: NSFont(name: .pragmaticaLight, size: 18), alignment: .left, isFocused: self.isFocused, isSecure: false, format: nil, isEditable: true, onEnterAction: self.onEnter)
                    .saturation(0)
                    .colorScheme(.light)
                    .padding(.horizontal, 0)
                    .allowsHitTesting(self.isEditing)
                    .offset(x: self.titleWidth, y: 0)
                    .frame(width: geometry.size.width - self.titleWidth, height: 30, alignment: .leading)

                Separator(color: Color.F.black, width: geometry.size.width - self.titleWidth)
                    .opacity(self.isEditing ? 0.25 : 0)
                    .offset(x: self.titleWidth, y: 29)
            }
        }.frame(height: 30)
    }
}
