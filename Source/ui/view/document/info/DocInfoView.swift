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
    @EnvironmentObject var modalViewObservable: ModalViewObservable
    @ObservedObject private var controller: DocInfoController
    @ObservedObject var state: ConspectusState

    private let font = NSFont(name: .pragmaticaLight, size: 24)
    private let title: String

    init(_ controller: DocInfoController, title: String = "INFO") {
        self.controller = controller
        state = controller.owner.state
        self.title = title
        print("InfoPanel init, id: \(controller.owner.id), hasPrentTag: \(controller.parentTag != nil)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            SectionView(isExpanded: $controller.isExpanded, title: title)

            if controller.isExpanded {
                if self.controller.parentTag != nil {
                    Spacer().frame(height: 5)

                    HStack(alignment: .lastTextBaseline, spacing: 5) {
                        Text("Supertag")
                            .font(Font.custom(.pragmaticaSemiBold, size: 21))
                            .foregroundColor(Color.F.black)
                            .padding(.leading, Constants.docViewLeading)
                            .frame(height: 30, alignment: .leading)

                        ConspectusLink(conspectus: self.controller.parentTag!, isEditing: self.state.isEditing, action: { action in
                            if action == .navigate {
                                self.controller.parentTag?.show()
                            } else if action == .remove {
                                self.controller.removeParentTag()
                            }
                        })
                    }

                    Spacer().frame(height: 5)
                }

                TextArea(text: $controller.info, textColor: NSColor.F.black, font: font, isEditable: state.isEditing && !modalViewObservable.isShown)
                    .layoutPriority(-1)
                    .saturation(0)
                    .colorScheme(.light)
                    .padding(.leading, Constants.docViewLeading - 5)
                    .padding(.trailing, 10)
                    .background(state.isEditing ? Color.F.whiteBG : Color.F.white)
                    .frame(height: TextArea.textHeightFrom(text: controller.info, width: 950 - Constants.docViewLeading, font: font, isShown: controller.isExpanded))
                    .onTapGesture(count: 2) {
                        if !self.controller.owner.state.isEditing {
                            notify(msg: "in die Zwischenablage kopiert")
                            let pasteBoard = NSPasteboard.general
                            pasteBoard.clearContents()
                            pasteBoard.setString(self.controller.info, forType: .string)
                        }
                    }
            }
        }
    }
}

struct BookInfoPanel: View {
    @ObservedObject private var controller: DocInfoController
    @EnvironmentObject var modalViewObservable: ModalViewObservable
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var content: BookContent
    @ObservedObject var state: ConspectusState

    private let font = NSFont(name: .pragmaticaLight, size: 18)
    private let title: String

    init(_ controller: DocInfoController, title: String = "INFO") {
        self.controller = controller
        content = (controller.owner as! Book).content
        state = controller.owner.state
        self.title = title
        print("BookInfoPanel init, id: \(controller.owner.id)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            SectionView(isExpanded: $controller.isExpanded, title: title)

            if controller.isExpanded {
                VStack(alignment: .leading, spacing: 5) {
                    FormInput(title: "TITEL", text: $content.fullTitle, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoTitle, onEnter: { self.textFocus.id = .bookInfoSubtitle })
                    FormInput(title: "UNTERTITEL", text: $content.subTitle, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoSubtitle, onEnter: { self.textFocus.id = .bookInfoAuthor })
                    FormInput(title: "AUTHOR", text: $content.authorText, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoAuthor, onEnter: { self.textFocus.id = .bookInfoIsbn })
                    HStack(alignment: .top, spacing: 5) {
                        FormInput(title: "ISBN", text: $content.ISBN, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoIsbn, onEnter: { self.textFocus.id = .bookInfoWritten })

                        if state.isEditing {
                            Button("", action: { self.controller.loadInfoFromInternet() })
                                .buttonStyle(IconButtonStyle(iconName: "internet", iconColor: Color.F.black, bgColor: Color.F.white, width: 30, height: 30))
                        }
                    }

                    FormInput(title: "GESCHRIEBEN", text: $content.writtenDate, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoWritten, onEnter: { self.textFocus.id = .bookInfoPublishDate })
                    FormInput(title: "ERSCHEINUNGSJAHR", text: $content.publishedDate, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoPublishDate, onEnter: { self.textFocus.id = .bookInfoPagesCount })
                    FormInput(title: "SEITENZAHL", text: $content.pageCount, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoPagesCount, onEnter: { self.textFocus.id = .bookInfoPublisher })
                    FormInput(title: "VERLAG", text: $content.publisher, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoPublisher, onEnter: { self.textFocus.id = .bookInfoPlace })
                    FormInput(title: "ORT", text: $content.place, isEditing: state.isEditing, isFocused: textFocus.id == .bookInfoPlace, onEnter: { self.textFocus.id = .bookInfoTitle })
                }.disabled(modalViewObservable.isShown)
                
                HStack(alignment: .top, spacing: 0) {
                    Text("LITERATURHINWEIS")
                        .font(Font.custom(.pragmaticaSemiBold, size: 18))
                        .foregroundColor(Color.F.black)
                        .padding(.trailing, 5)
                        .frame(width: 295, height: 30, alignment: .trailing)
                        .background(Color.F.whiteBG)

                    TextArea(text: $content.reference, textColor: NSColor.F.black, font: font, isEditable: state.isEditing && !modalViewObservable.isShown)
                        .layoutPriority(-1)
                        .saturation(0)
                        .colorScheme(.light)
                        .offset(x: 0, y: -1)
                        .padding(.leading, 3)
                        .padding(.trailing, 5)
                        .background(state.isEditing ? Color.F.whiteBG : Color.F.white)
                        .frame(width: 645, height: TextArea.textHeightFrom(text: content.reference, width: 645, font: font, isShown: controller.isExpanded))
                        .onTapGesture(count: 2) {
                            if !self.state.isEditing {
                                notify(msg: "in die Zwischenablage kopiert")
                                let pasteBoard = NSPasteboard.general
                                pasteBoard.clearContents()
                                pasteBoard.setString(self.content.info, forType: .string)
                            }
                        }
                }

                HStack(alignment: .top, spacing: 0) {
                    Text("INHALTSANGABE")
                        .font(Font.custom(.pragmaticaSemiBold, size: 18))
                        .foregroundColor(Color.F.black)
                        .padding(.trailing, 5)
                        .frame(width: 295, height: 30, alignment: .trailing)
                        .background(Color.F.whiteBG)

                    TextArea(text: $content.info, textColor: NSColor.F.black, font: font, isEditable: state.isEditing && !modalViewObservable.isShown)
                        .layoutPriority(-1)
                        .saturation(0)
                        .colorScheme(.light)
                        .offset(x: 0, y: -1)
                        .padding(.leading, 3)
                        .padding(.trailing, 5)
                        .background(state.isEditing ? Color.F.whiteBG : Color.F.white)
                        .frame(width: 645, height: TextArea.textHeightFrom(text: content.info, width: 645, font: font, isShown: controller.isExpanded))
                        .onTapGesture(count: 2) {
                            if !self.state.isEditing {
                                notify(msg: "in die Zwischenablage kopiert")
                                let pasteBoard = NSPasteboard.general
                                pasteBoard.clearContents()
                                pasteBoard.setString(self.content.info, forType: .string)
                            }
                        }
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
        HStack(alignment: .center, spacing: 5) {
            Text(self.title)
                .font(Font.custom(.pragmaticaSemiBold, size: 18))
                .foregroundColor(Color.F.black)
                .frame(width: self.titleWidth - 5, height: 30, alignment: .trailing)
                .background(Color.F.whiteBG)

            TextInput(title: "", text: self.$text, textColor: NSColor.F.black, font: NSFont(name: .pragmaticaLight, size: 18), alignment: .left, isFocused: self.isFocused, isSecure: false, format: nil, isEditable: self.isEditing, onEnterAction: self.onEnter)
                .saturation(0)
                .colorScheme(.light)
                .padding(.horizontal, 0)
                .allowsHitTesting(self.isEditing)
                .frame(width: 640, height: 30, alignment: .leading)

        }.frame(height: 30)
            .background(Separator(color: Color.F.black, width: .infinity)
                .opacity(self.isEditing ? 0.25 : 0)
                .padding(.leading, self.titleWidth)
                .padding(.top, 29))
    }
}
