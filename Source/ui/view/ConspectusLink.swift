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
    let font: Font
    let textColor: Color
    let btnIconColor: Color
    let height: CGFloat
    let showDetails: Bool
    let showLinkIcon: Bool
    let showSeparator: Bool
    let leading: CGFloat
    let onLinkAction: ((ConspectusLinkAction) -> Void)?

    init(conspectus: Conspectus, isEditing: Bool, fontSize: CGFloat = 21, height: CGFloat = 30, isLightMode: Bool = true, level: Int = 0,
         showDetails: Bool = false, showLinkIcon: Bool = false, showSeparator: Bool = false, leading: CGFloat = 0, action: ((ConspectusLinkAction) -> Void)?) {
        self.conspectus = conspectus
        state = conspectus.state
        self.showLinkIcon = showLinkIcon
        self.showSeparator = showSeparator
        self.leading = leading
        
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
        self.height = height
        self.showDetails = showDetails
        font = Font.custom(showDetails ? .pragmaticaSemiBold : isEditing ? .pragmaticaLight : .pragmaticaLightItalics, size: fontSize)

        onLinkAction = action
    }

    @State private var hover = false

    var body: some View {
        HStack(alignment: .top, spacing: 5) {
            if showSeparator {
                Separator(color: Color.F.black, width: 3, height: .infinity)
                    .padding(.leading, 2)
                    .padding(.trailing, 15)
                    .padding(.vertical, -10)
            }

            if showLinkIcon {
                Image("link")
                    .renderingMode(.template)
                    .foregroundColor(Color(conspectus.genus))
                    .allowsHitTesting(false)
                    .offset(y: 8)
            }
            VStack(alignment: .leading, spacing: 10) {
                Text(" \(name)")
                    .underline(self.hover && !isEditing, color: self.state.isRemoved ? Color.F.red : textColor)
                    .lineLimit(1)
                    .frame(height: height)
                    .foregroundColor(state.isRemoved ? Color.F.red : textColor)
                    .font(self.font)
                    .onHover { value in self.hover = value }
                    .onTapGesture {
                        if !self.isEditing {
                            self.onLinkAction?(.navigate)
                        }
                    }

                if showDetails && !details.isEmpty {
                    Text(details)
                        .padding(.trailing, 0)
                        .padding(.leading, -29)
                        .foregroundColor(textColor)
                        .font(Font.custom(.pragmaticaLight, size: 21))
                }
            }

            if showDetails {
                Spacer()
            }

            Button("", action: { self.onLinkAction?(.remove) })
                .buttonStyle(IconButtonStyle(iconName: "smallClose", iconColor: btnIconColor, bgColor: textColor, width: 20, height: 20, radius: 10))
                .opacity(isEditing ? 1 : 0)
                .offset(y: (height - 20) / 2)

            if !showDetails {
                Spacer()
            }

        }.padding(.vertical, showDetails ? 10 : 0)
            .padding(.leading, leading)
            .background(showDetails ? Color.F.whiteBG : Color.clear)
    }
}
