//
//  DocViewHeaders.swift
//  Faustus
//
//  Created by Alexander Dittner on 01.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import Foundation
import SwiftUI

struct UserHeader: View {
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var user: User
    let onClosedAction: () -> Void

    init(user: User, onClosed: @escaping () -> Void) {
        self.user = user
        onClosedAction = onClosed

        print("UserHeader init, user has changes: \(user.hasChanges)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .lastTextBaseline, spacing: 10) {
                Button("") {
                    self.onClosedAction()
                }.buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: Color.F.white))

                Spacer().frame(width: 10)

                TextInput(title: "Vorname", text: $user.content.name, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 30), alignment: .right, isFocused: textFocus.id == .headerAuthorName, isSecure: false, format: nil, isEditable: user.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorSurname })
                    .saturation(0)

                TextInput(title: "Nachname", text: $user.content.surname, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaBold, size: 30), alignment: .left, isFocused: textFocus.id == .headerAuthorSurname, isSecure: false, format: nil, isEditable: user.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorName })
                    .saturation(0)

                Toggle("", isOn: $user.isEditing)
                    .toggleStyle(RoundToggleStyle(onColor: Color(user.genus)))
            }
            .offset(x: 0, y: 14)
            .padding(.horizontal, 15)
            .frame(height: 50)

            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Image("changed")
                    .renderingMode(.template)
                    .allowsHitTesting(false)
                    .foregroundColor(Color.F.white)
                    .frame(width: 30)
                    .opacity(user.hasChanges ? 1 : 0)

                Spacer()
            }
            .padding(.horizontal, 15)
            .frame(height: 50)
        }.background(Color.F.black)
    }
}

struct AuthorHeader: View {
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var author: Author
    let onClosedAction: () -> Void

    init(author: Author, onClosed: @escaping () -> Void) {
        self.author = author
        onClosedAction = onClosed

        print("AuthorHeader init, author: \(author.id), has changes: \(author.hasChanges)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Gelöscht am \(author.changedDate)")
                .lineLimit(1)
                .font(Font.custom(.mono, size: 13))
                .foregroundColor(Color.F.white)
                .frame(width: 1000, height: 20)
                .opacity(author.isRemoved ? 1 : 0)

            HStack(alignment: .lastTextBaseline, spacing: 10) {
                Button("") {
                    self.onClosedAction()
                }.buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: Color.F.white))

                Spacer().frame(width: 10)

                TextInput(title: "Vorname", text: $author.content.name, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 30), alignment: .right, isFocused: textFocus.id == .headerAuthorName, isSecure: false, format: nil, isEditable: author.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorSurname })
                    .saturation(0)

                TextInput(title: "Nachname", text: $author.content.surname, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaBold, size: 30), alignment: .left, isFocused: textFocus.id == .headerAuthorSurname, isSecure: false, format: nil, isEditable: author.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorBirthYear })
                    .saturation(0)

                Toggle("", isOn: $author.isEditing)
                    .toggleStyle(RoundToggleStyle(onColor: Color(author.genus), disabled: author.isRemoved))
                    .disabled(author.isRemoved)
            }
            .offset(x: 0, y: 4)
            .padding(.horizontal, 15)
            .frame(height: 30)

            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Image("changed")
                    .renderingMode(.template)
                    .allowsHitTesting(false)
                    .foregroundColor(Color.F.white)
                    .frame(width: 30)
                    .opacity(author.hasChanges ? 1 : 0)

                Spacer()

                TextInput(title: "geboren", text: $author.content.birthYear, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 16), alignment: .right, isFocused: textFocus.id == .headerAuthorBirthYear, isSecure: false, format: "-?[0-9]{0,4}", isEditable: author.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorDeathYear })
                    .saturation(0)
                    .frame(width: 100)

                Text("–")
                    .font(Font.custom(.pragmaticaExtraLight, size: 16))
                    .foregroundColor(Color.F.white)
                    .frame(width: 10, alignment: .center)
                    .opacity($author.content.deathYear.wrappedValue.count == 0 ? 0.25 : 1)

                TextInput(title: "gestorben", text: $author.content.deathYear, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 16), alignment: .left, isFocused: textFocus.id == .headerAuthorDeathYear, isSecure: false, format: "-?[0-9]{0,4}", isEditable: author.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorName })
                    .saturation(0)
                    .frame(width: 100)

                Spacer()

                Spacer().frame(width: 30)
            }
            .padding(.horizontal, 15)
            .frame(height: 50)

        }.background(author.isRemoved ? Color.F.red : Color.F.black)
    }
}

struct BookHeader: View {
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var book: Book
    let onClosedAction: () -> Void

    init(book: Book, onClosed: @escaping () -> Void) {
        self.book = book
        onClosedAction = onClosed

        print("BookHeader init, book: \(book.id), has changes: \(book.hasChanges)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Gelöscht am \(book.changedDate)")
                .lineLimit(1)
                .font(Font.custom(.mono, size: 13))
                .foregroundColor(Color.F.white)
                .frame(width: 1000, height: 20)
                .opacity(book.isRemoved ? 1 : 0)

            HStack(alignment: .lastTextBaseline, spacing: 10) {
                Button("") {
                    self.onClosedAction()
                }.buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: Color.F.white))

                Spacer().frame(width: 10)

                TextInput(title: "Titel", text: $book.content.title, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaBold, size: 30), alignment: .center, isFocused: textFocus.id == .headerBookTitle, isSecure: false, format: nil, isEditable: book.isEditing, onEnterAction: { self.textFocus.id = .headerBookWritten })
                    .saturation(0)

                Toggle("", isOn: $book.isEditing)
                    .toggleStyle(RoundToggleStyle(onColor: Color(book.genus), disabled: book.isRemoved))
                    .disabled(book.isRemoved)
            }
            .offset(x: 0, y: 4)
            .padding(.horizontal, 15)
            .frame(height: 30)

            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Image("changed")
                    .renderingMode(.template)
                    .allowsHitTesting(false)
                    .foregroundColor(Color.F.white)
                    .frame(width: 30)
                    .opacity(book.hasChanges ? 1 : 0)

                Spacer()

                TextInput(title: "geschrieben", text: $book.content.writtenDate, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 16), alignment: .right, isFocused: textFocus.id == .headerBookWritten, isSecure: false, format: "-?[0-9]{0,4}", isEditable: book.isEditing, onEnterAction: { self.textFocus.id = .headerBookAuthor })
                    .saturation(0)
                    .frame(width: 200)

                Text(", ")
                    .font(Font.custom(.pragmaticaExtraLight, size: 16))
                    .foregroundColor(Color.F.white)
                    .frame(width: 10, alignment: .center)
                    .opacity(book.content.authorText.isEmpty ? 0.25 : 1)

                TextInput(title: "Author", text: $book.content.authorText, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 16), alignment: .left, isFocused: textFocus.id == .headerBookAuthor, isSecure: false, format: nil, isEditable: book.isEditing, onEnterAction: { self.textFocus.id = .headerBookTitle })
                    .saturation(0)
                    .frame(width: 200)

                Spacer()

                Spacer().frame(width: 30)
            }
            .padding(.horizontal, 15)
            .frame(height: 50)
        }.background(book.isRemoved ? Color.F.red : Color.F.black)
    }
}

struct TagHeader: View {
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var tag: Tag
    let onClosedAction: () -> Void

    init(tag: Tag, onClosed: @escaping () -> Void) {
        self.tag = tag
        onClosedAction = onClosed

        print("TagHeader init, tag has changes: \(tag.hasChanges)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Gelöscht am \(tag.changedDate)")
                .lineLimit(1)
                .font(Font.custom(.mono, size: 13))
                .foregroundColor(Color.F.white)
                .frame(width: 1000, height: 20)
                .opacity(tag.isRemoved ? 1 : 0)

            HStack(alignment: .lastTextBaseline, spacing: 10) {
                Button("") {
                    self.onClosedAction()
                }.buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: Color.F.white))

                Spacer().frame(width: 10)

                TextInput(title: "Name", text: $tag.content.name, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaBold, size: 30), alignment: .center, isFocused: false, isSecure: false, format: nil, isEditable: tag.isEditing, onEnterAction: nil)
                    .saturation(0)

                Toggle("", isOn: $tag.isEditing)
                    .toggleStyle(RoundToggleStyle(onColor: Color(tag.genus), disabled: tag.isRemoved))
                    .disabled(tag.isRemoved)
            }
            .offset(x: 0, y: 4)
            .padding(.horizontal, 15)
            .frame(height: 30)

            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Image("changed")
                    .renderingMode(.template)
                    .allowsHitTesting(false)
                    .foregroundColor(Color.F.white)
                    .frame(width: 30)
                    .opacity(tag.hasChanges ? 1 : 0)

                Spacer()
            }
            .padding(.horizontal, 15)
            .frame(height: 50)
        }.background(tag.isRemoved ? Color.F.red : Color.F.black)
    }
}
