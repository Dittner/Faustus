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
    @ObservedObject private var controller: DocInfoController
    @ObservedObject var state: ConspectusState
    let scrollController: CustomScrollViewController
    private let font = NSFont(name: .pragmaticaLight, size: 18)

    init(_ controller: DocInfoController, scrollController: CustomScrollViewController) {
        self.controller = controller
        self.scrollController = scrollController
        state = controller.owner.state
        print("InfoPanel init, id: \(controller.owner.id), hasPrentTag: \(controller.parentTag != nil)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if self.controller.parentTag != nil {
                Spacer().frame(height: 5)

                HStack(alignment: .lastTextBaseline, spacing: 5) {
                    Text("Supertag")
                        .font(Font.custom(.pragmaticaSemiBold, size: 21))
                        .foregroundColor(Color.F.black)
                        .frame(height: 30, alignment: .leading)

                    ConspectusLink(conspectus: self.controller.parentTag!, isEditing: self.state.isEditing, action: { action in
                        if action == .navigate {
                            self.controller.parentTag?.show()
                        } else if action == .remove {
                            self.controller.removeParentTag()
                        }
                    })

                    Spacer()
                }

                Spacer().frame(height: 5)
            }

            MultilineInput(text: $controller.info,
                           width: Constants.docViewWidth - Constants.docViewLeading,
                           textColor: NSColor.F.black,
                           font: font,
                           isEditing: state.isEditing,
                           onBeginTyping: { self.scrollController.animateWhenContentHeightIsChanging = true },
                           onEndTyping: { self.scrollController.animateWhenContentHeightIsChanging = false })
                .background(state.isEditing ? Color.F.whiteBG : Color.F.white)
            
            Spacer()

        }.padding(.leading, Constants.docViewLeading - Constants.docViewPadding)
    }
}

struct BookInfoPanel: View {
    @ObservedObject private var controller: DocInfoController
    @EnvironmentObject var modalViewObservable: ModalViewObservable
    @EnvironmentObject var textFocus: TextFocus
    @ObservedObject var content: BookContent
    @ObservedObject var state: ConspectusState

    private let font = NSFont(name: .pragmaticaLight, size: 18)
    public static let rightColumnWidth: CGFloat = Constants.docViewWidth - 4 * Constants.docViewPadding - FormInput.titleWidth

    init(_ controller: DocInfoController) {
        self.controller = controller
        content = (controller.owner as! Book).content
        state = controller.owner.state
        print("BookInfoPanel init, id: \(controller.owner.id)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
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

            HStack(alignment: .top, spacing: 5) {
                Text("LITERATURHINWEIS")
                    .font(Font.custom(.pragmaticaSemiBold, size: 18))
                    .foregroundColor(Color.F.black)
                    .padding(.trailing, 5)
                    .frame(width: FormInput.titleWidth, height: 30, alignment: .trailing)
                    .background(Color.F.whiteBG)

                MultilineInput(text: $content.reference, width: BookInfoPanel.rightColumnWidth, textColor: NSColor.F.black, font: font, isEditing: state.isEditing, horizontalPadding: 4)
                    .background(state.isEditing ? Color.F.whiteBG : Color.F.white)

            }.padding(.top, 5)

            HStack(alignment: .top, spacing: 5) {
                Text("INHALTSANGABE")
                    .font(Font.custom(.pragmaticaSemiBold, size: 18))
                    .foregroundColor(Color.F.black)
                    .padding(.trailing, 5)
                    .frame(width: FormInput.titleWidth, height: 30, alignment: .trailing)
                    .background(Color.F.whiteBG)

                MultilineInput(text: $content.info, width: BookInfoPanel.rightColumnWidth, textColor: NSColor.F.black, font: font, isEditing: state.isEditing, horizontalPadding: 4)
                    .background(state.isEditing ? Color.F.whiteBG : Color.F.white)

                if state.isEditing {
                    Button("", action: { self.controller.formatBookInfo() })
                        .buttonStyle(IconButtonStyle(iconName: "format", iconColor: Color.F.black, bgColor: Color.F.grayBG, width: 30, height: 30))
                        .contextMenu {
                            Button("Remove space duplicates", action: { self.controller.removeSpaceDuplicates() })
                            Button("Remove word wrapping", action: { self.controller.removeWordWrapping() })
                            Button("Replace hyphen with dash", action: { self.controller.replaceHyphenWithDash() })
                        }
                }
            }
            
            Spacer()
        }
    }
}

struct FormInput: View {
    public let title: String
    @Binding var text: String
    public let isEditing: Bool
    public let isFocused: Bool
    public let onEnter: (() -> Void)?
    public static let titleWidth: CGFloat = 300

    var body: some View {
        HStack(alignment: .center, spacing: 5) {
            Text(self.title)
                .font(Font.custom(.pragmaticaSemiBold, size: 18))
                .foregroundColor(Color.F.black)
                .frame(width: FormInput.titleWidth - 5, height: 30, alignment: .trailing)
                .padding(.trailing, 5)
                .background(Color.F.whiteBG)

            TextInput(title: "", text: self.$text, textColor: NSColor.F.black, font: NSFont(name: .pragmaticaLight, size: 18), alignment: .left, isFocused: self.isFocused, isSecure: false, format: nil, isEditable: self.isEditing, onEnterAction: self.onEnter)
                .saturation(0)
                .colorScheme(.light)
                .padding(.horizontal, 0)
                .allowsHitTesting(self.isEditing)
                .frame(width: BookInfoPanel.rightColumnWidth, height: 30, alignment: .leading)

        }.frame(height: 30)
            .background(Separator(color: Color.F.black, width: .infinity)
                .opacity(self.isEditing ? 0.25 : 0)
                .padding(.leading, FormInput.titleWidth)
                .padding(.top, 29))
    }
}
