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
    @EnvironmentObject var vm: DocViewModel
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var state: ConspectusState
    @ObservedObject var user: User

    init(user: User) {
        self.user = user
        state = user.state

        print("UserHeader init, user has changes: \(state.hasChanges)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .lastTextBaseline, spacing: 10) {
                Button("", action: vm.close)
                    .buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: Color.F.white))

                Spacer().frame(width: 10)

                TextInput(title: "Vorname", text: $user.content.name, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 30), alignment: .right, isFocused: textFocus.id == .headerAuthorName, isSecure: false, format: nil, isEditable: state.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorSurname })
                    .saturation(0)

                TextInput(title: "Nachname", text: $user.content.surname, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaBold, size: 30), alignment: .left, isFocused: textFocus.id == .headerAuthorSurname, isSecure: false, format: nil, isEditable: state.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorName })
                    .saturation(0)

                Toggle("", isOn: $state.isEditing)
                    .toggleStyle(RoundToggleStyle(onColor: Color(user.genus)))
            }
            .offset(x: 0, y: 14)
            .padding(.horizontal, 15)
            .frame(height: 50)

            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Button("") {
                    _ = self.user.store()
                }.buttonStyle(IconButtonStyle(iconName: "store", iconColor: Color.F.white, bgColor: Color.F.black))
                    .opacity(state.hasChanges ? 1 : 0)

                Spacer()
            }
            .padding(.horizontal, 15)
            .frame(height: 50)
        }
    }
}

struct AuthorHeader: View {
    @EnvironmentObject var vm: DocViewModel
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var author: Author
    @ObservedObject var state: ConspectusState

    init(author: Author) {
        self.author = author
        state = author.state

        print("AuthorHeader init, author: \(author.id), has changes: \(state.hasChanges)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Gelöscht am \(state.changedDate)")
                .lineLimit(1)
                .font(Font.custom(.mono, size: 13))
                .foregroundColor(Color.F.white)
                .frame(width: 1000, height: 20)
                .opacity(state.isRemoved ? 1 : 0)

            HStack(alignment: .lastTextBaseline, spacing: 10) {
                Button("", action: vm.close)
                    .buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: Color.F.white))

                Spacer().frame(width: 10)

                TextInput(title: "Vorname", text: $author.content.name, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 30), alignment: .right, isFocused: textFocus.id == .headerAuthorName, isSecure: false, format: nil, isEditable: state.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorSurname })
                    .saturation(0)

                TextInput(title: "Nachname", text: $author.content.surname, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaBold, size: 30), alignment: .left, isFocused: textFocus.id == .headerAuthorSurname, isSecure: false, format: nil, isEditable: state.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorBirthYear })
                    .saturation(0)

                Toggle("", isOn: $state.isEditing)
                    .toggleStyle(RoundToggleStyle(onColor: Color(author.genus), disabled: state.isRemoved))
                    .disabled(state.isRemoved)
            }
            .offset(x: 0, y: 4)
            .padding(.horizontal, 15)
            .frame(height: 30)

            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Button("") {
                    _ = self.author.store()
                }.buttonStyle(IconButtonStyle(iconName: "store", iconColor: Color.F.white, bgColor: state.isRemoved ? Color.F.red : Color.F.black))
                    .opacity(state.hasChanges ? 1 : 0)

                Spacer()

                TextInput(title: "geboren", text: $author.content.birthYear, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 16), alignment: .right, isFocused: textFocus.id == .headerAuthorBirthYear, isSecure: false, format: "-?[0-9]{0,4}", isEditable: state.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorDeathYear })
                    .saturation(0)
                    .frame(width: 100)

                Text("–")
                    .font(Font.custom(.pragmaticaExtraLight, size: 16))
                    .foregroundColor(Color.F.white)
                    .frame(width: 10, alignment: .center)
                    .opacity($author.content.deathYear.wrappedValue.count == 0 ? 0.25 : 1)
                

                TextInput(title: "gestorben", text: $author.content.deathYear, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 16), alignment: .left, isFocused: textFocus.id == .headerAuthorDeathYear, isSecure: false, format: "-?[0-9]{0,4}", isEditable: state.isEditing, onEnterAction: { self.textFocus.id = .headerAuthorName })
                    .saturation(0)
                    .frame(width: 100)

                Spacer()

                Spacer().frame(width: 30)
            }
            .padding(.horizontal, 15)
            .frame(height: 50)
        }
    }
}

struct BookHeader: View {
    @EnvironmentObject var vm: DocViewModel
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var book: Book
    @ObservedObject var bookContent: BookContent
    @ObservedObject var state: ConspectusState
    @ObservedObject var chooser: ConspectusChooser

    init(book: Book, chooser: ConspectusChooser) {
        self.book = book
        self.chooser = chooser
        state = book.state
        bookContent = book.content

        print("BookHeader init, book: \(book.id), has changes: \(state.hasChanges)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Gelöscht am \(state.changedDate)")
                .lineLimit(1)
                .font(Font.custom(.mono, size: 13))
                .foregroundColor(Color.F.white)
                .frame(width: 1000, height: 20)
                .opacity(state.isRemoved ? 1 : 0)

            HStack(alignment: .lastTextBaseline, spacing: 10) {
                Button("", action: vm.close)
                    .buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: Color.F.white))

                Spacer().frame(width: 10)

                TextInput(title: "Titel", text: $book.content.title, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaBold, size: 30), alignment: .center, isFocused: textFocus.id == .headerBookTitle, isSecure: false, format: nil, isEditable: state.isEditing, onEnterAction: { self.textFocus.id = .headerBookWritten })
                    .saturation(0)

                Toggle("", isOn: $state.isEditing)
                    .toggleStyle(RoundToggleStyle(onColor: Color(book.genus), disabled: state.isRemoved))
                    .disabled(state.isRemoved)
            }
            .offset(x: 0, y: 4)
            .padding(.horizontal, 15)
            .frame(height: 30)

            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Button("") {
                    _ = self.book.store()
                }.buttonStyle(IconButtonStyle(iconName: "store", iconColor: Color.F.white, bgColor: state.isRemoved ? Color.F.red : Color.F.black))
                    .opacity(state.hasChanges ? 1 : 0)

                Spacer().frame(width: 250)

                TextInput(title: "geschrieben", text: $book.content.writtenDate, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 16), alignment: .right, isFocused: textFocus.id == .headerBookWritten, isSecure: false, format: "-?[0-9]{0,4}", isEditable: state.isEditing, onEnterAction: { self.textFocus.id = .headerBookAuthor })
                    .saturation(0)
                    .frame(width: 200)

                Text(", ")
                    .font(Font.custom(.pragmaticaExtraLight, size: 16))
                    .foregroundColor(Color.F.white)
                    .frame(width: 10, alignment: .center)
                    .opacity(book.content.authorText.isEmpty && book.content.author == nil ? 0.25 : 1)

                if bookContent.author == nil {
                    TextInput(title: "Author", text: $book.content.authorText, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 16), alignment: .left, isFocused: textFocus.id == .headerBookAuthor, isSecure: false, format: nil, isEditable: state.isEditing, onEnterAction: { self.textFocus.id = .headerBookTitle })
                        .saturation(0)
                        .frame(width: 300)
                } else {
                    ConspectusLink(conspectus: bookContent.author!, isEditing: self.state.isEditing, fontSize: 16, height: 20, isLightMode: false, action: { result in
                        switch result {
                        case .remove:
                            (self.bookContent.author! as! BooksOwner).booksColl.removeBook(self.book)
                        case .navigate:
                            self.bookContent.author!.show()
                        }
                    }).frame(width: 300)
                }

                SelectableText(text: "+Author", color: Color.F.white)
                    .font(Font.custom(.mono, size: 13))
                    .padding(.leading, 0)
                    .padding(.top, 0)
                    .onTapGesture {
                        self.chooser.chooseAuthor(self.book)
                    }
                    .frame(width: 180, alignment: .trailing)
                    .opacity(state.isEditing && bookContent.author == nil ? 1 : 0)
            }
            .padding(.horizontal, 15)
            .frame(height: 50)
        }
    }
}

struct TagHeader: View {
    @EnvironmentObject var vm: DocViewModel
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var tag: Tag
    @ObservedObject var state: ConspectusState
    @ObservedObject var tagContent: TagContent
    @ObservedObject var chooser: ConspectusChooser

    init(tag: Tag, chooser: ConspectusChooser) {
        self.tag = tag
        self.chooser = chooser
        tagContent = tag.content
        state = tag.state

        print("TagHeader init, tag has changes: \(state.hasChanges)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Gelöscht am \(state.changedDate)")
                .lineLimit(1)
                .font(Font.custom(.mono, size: 13))
                .foregroundColor(Color.F.white)
                .frame(width: 1000, height: 20)
                .opacity(state.isRemoved ? 1 : 0)

            HStack(alignment: .lastTextBaseline, spacing: 10) {
                Button("", action: vm.close)
                    .buttonStyle(IconButtonStyle(iconName: "close", iconColor: Color.F.black, bgColor: Color.F.white))

                Spacer().frame(width: 10)

                TextInput(title: "Name", text: $tag.content.name, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaBold, size: 30), alignment: .center, isFocused: false, isSecure: false, format: nil, isEditable: state.isEditing, onEnterAction: nil)
                    .saturation(0)

                Toggle("", isOn: $state.isEditing)
                    .toggleStyle(RoundToggleStyle(onColor: Color(tag.genus), disabled: state.isRemoved))
                    .disabled(state.isRemoved)
            }
            .offset(x: 0, y: 4)
            .padding(.horizontal, 15)
            .frame(height: 30)

            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Button("") {
                    _ = self.tag.store()
                }.buttonStyle(IconButtonStyle(iconName: "store", iconColor: Color.F.white, bgColor: state.isRemoved ? Color.F.red : Color.F.black))
                    .opacity(state.hasChanges ? 1 : 0)

                Spacer()

                SelectableText(text: "+Supertag", color: Color.F.white)
                    .font(Font.custom(.mono, size: 13))
                    .padding(.leading, 0)
                    .padding(.top, 0)
                    .onTapGesture {
                        self.chooser.chooseParentTag(self.tag)
                    }
                    .frame(width: 180, alignment: .trailing)
                    .opacity(state.isEditing && tagContent.parentTag == nil ? 1 : 0)
            }
            .padding(.horizontal, 15)
            .frame(height: 50)
        }
    }
}
