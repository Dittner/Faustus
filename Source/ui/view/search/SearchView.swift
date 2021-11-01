//
//  ContentView.swift
//  Faustus
//
//  Created by Alexander Dittner on 06.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

struct SearchView: View {
    @EnvironmentObject var vm: SearchViewModel
    let nextBtnStyle = IconButtonStyle(iconName: "next", iconColor: Color.F.whiteBG, bgColor: Color.F.black, width: 50, height: 30)

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Image("search")
                    .renderingMode(.template)
                    .foregroundColor(Color.F.black)
                    .frame(width: 50)

                TextInput(title: "", text: $vm.filterText, textColor: NSColor.F.black, font: NSFont(name: .pragmaticaLight, size: 21), alignment: .left, isFocused: false, isSecure: false, format: nil, isEditable: true, onEnterAction: nil)
                    .frame(height: 50, alignment: .leading)
                    .padding(.horizontal, -5)
                    .saturation(0)
                    .colorScheme(.light)

                Button("", action: { self.vm.startToFilterFlag = true })
                    .offset(x: -2, y: 4)
                    .buttonStyle(nextBtnStyle)
                    .opacity(self.vm.startToFilterFlag == false ? 1 : 0)
            }
            .offset(x: 0, y: 11)
            .frame(height: 50)
            .background(Color.F.white)

            HStack(alignment: .center, spacing: 10) {
                Spacer()

                FilterTabBar(selectedFilter: $vm.selectedFilter)
                    .cornerRadius(2)

                Spacer()
            }
            .padding(.trailing, 15)
            .frame(height: 50)
            .background(Color.F.black)

            if vm.result.count > 0 {
                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 1) {
                        ForEach(vm.pageContent, id: \.id) { conspectus in
                            ConspectusRow(action: { _ in self.vm.select(conspectus: conspectus) }, conspectus: conspectus)
                        }
                    }
                }
            }

            if vm.totalPages > 1 {
                HStack(alignment: .center, spacing: 0) {
                    Spacer()

                    Button("", action: { self.vm.prevPage() })
                        .buttonStyle(nextBtnStyle)
                        .rotationEffect(Angle(degrees: -180))

                    Text("\(vm.curPage+1)/\(vm.totalPages)")
                        .font(Font.custom(.mono, size: 18))
                        .foregroundColor(Color.F.gray)
                        .frame(width: 100, height: 30)

                    Button("", action: { self.vm.nextPage() })
                        .buttonStyle(nextBtnStyle)

                    Spacer()
                }
                .padding(.trailing, 15)
                .frame(height: 50)
                .background(Color.F.black)
            }
        }

        .fillParent()
    }
}

struct FilterTabBar: View {
    @Binding var selectedFilter: SearchFilter
    var iconColor: Color = Color.F.gray
    var bgColor: Color = Color.F.dark
    var selectedIconColor: Color = Color.F.dark
    var selectBgColor: Color = Color.F.gray

    var enabledFilters: [SearchFilter] = [.authors, .books, .tags, .quotes, .removed]

    var body: some View {
        HStack(alignment: .center, spacing: 1) {
            ForEach(enabledFilters, id: \.self) { filter in
                Image(filter.toIcon())
                    .renderingMode(.template)
                    .frame(width: 50, height: 30)
                    .foregroundColor(self.selectedFilter == filter ? self.selectedIconColor : self.iconColor)
                    .background(self.selectedFilter == filter ? self.selectBgColor : self.bgColor)
                    .onTapGesture {
                        self.selectedFilter = filter
                    }
            }
        }
    }
}
