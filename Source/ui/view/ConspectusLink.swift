//
//  ConspectusLink.swift
//  Faustus
//
//  Created by Alexander Dittner on 09.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

enum ConspectusLinkAction: Int {
    case remove
    case navigate
}

struct ConspectusLink: View {
    @ObservedObject var state: ConspectusState
    let conspectus: Conspectus
    let name: String
    let details: String
    let isEditing: Bool
    let titleFont: Font
    let detailsFont: Font
    let textColor: Color
    let btnIconColor: Color
    let withDetails: Bool
    let onLinkAction: ((ConspectusLinkAction) -> Void)?

    init(conspectus: Conspectus, isEditing: Bool, isLightMode: Bool = true, level: Int = 0,
         withDetails: Bool = true, action: ((ConspectusLinkAction) -> Void)?) {
        self.conspectus = conspectus
        state = conspectus.state
        self.withDetails = withDetails

        switch conspectus.genus {
        case .author:
            name = "\((conspectus as! Author).content.surname) \((conspectus as! Author).content.initials)"
            details = ""
        case .user:
            name = "\((conspectus as! User).content.surname) \((conspectus as! User).content.initials)"
            details = ""
        case .book:
            let bookInfo = (conspectus as! Book).content
            let authorInfo = bookInfo.getAuthorFullName()

            if !authorInfo.isEmpty {
                name = "\(bookInfo.title), \(authorInfo), \(bookInfo.writtenDate)"
            } else {
                name = "\(bookInfo.title), \(bookInfo.writtenDate)"
            }

            details = ""
        case .tag:
            name = (conspectus as! Tag).content.name
            details = ""
        case .quote:
            let bookInfo = (conspectus as! Quote).book.content
            let authorInfo = bookInfo.getAuthorFullName()

            if !authorInfo.isEmpty {
                name = "\(bookInfo.title), \(authorInfo), \(bookInfo.writtenDate), s.\((conspectus as! Quote).startPage)"
            } else {
                name = "\(bookInfo.title), \(bookInfo.writtenDate), s.\((conspectus as! Quote).startPage)"
            }

            details = (conspectus as! Quote).text
        }

        self.isEditing = isEditing

        textColor = isLightMode ? Color.F.black : Color.F.white
        btnIconColor = isLightMode ? Color.F.white : Color.F.black
        titleFont = Font.custom(withDetails ? .mono : .pragmaticaLightItalics, size: 16)
        detailsFont = Font.custom((conspectus as? Quote)?.book.content.author?.genus == .user ? .pragmaticaLightItalics : .pragmaticaLight, size: 16)

        onLinkAction = action
    }

    @State private var hover = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .top, spacing: 0) {
                Text("\(name)")
                    .underline(self.hover && !isEditing, color: self.state.isRemoved ? Color.F.red : textColor)
                    .lineLimit(1)
                    .foregroundColor(state.isRemoved ? Color.F.red : textColor)
                    .font(self.titleFont)
                    .padding(.horizontal, 8)
                    .frame(height: withDetails ? 30 : 20, alignment: .center)
                    .background(Color(conspectus.genus).opacity(0.2))
                    .cornerRadius(4)
                    .onHover { value in self.hover = value }
                    .onTapGesture {
                        if !self.isEditing {
                            self.onLinkAction?(.navigate)
                        }
                    }

                Button("", action: { self.onLinkAction?(.remove) })
                    .buttonStyle(IconButtonStyle(iconName: "smallClose", iconColor: btnIconColor, bgColor: Color(conspectus.genus), width: 20, height: 20, radius: 10))
                    .opacity(isEditing ? 1 : 0)
                    .layoutPriority(1)
                    .offset(x: -10, y: -5)

                if withDetails && !details.isEmpty {
                    Spacer()
                }
            }

            if withDetails && !details.isEmpty {
                Text(details)
                    .foregroundColor(textColor)
                    .font(self.detailsFont)
                    .padding(.horizontal, 8)
                    .padding(.top, 5)
                    .padding(.bottom, 10)
            }
        }.background(withDetails && !details.isEmpty ? Color.F.whiteBG : Color.F.clear)
    }
}
