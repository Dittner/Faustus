//
//  ContentView.swift
//  Faustus
//
//  Created by Alexander Dittner on 06.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

struct LoginView: View {
    @EnvironmentObject var vm: LoginViewModel
    @EnvironmentObject var textFocus: TextFocus

    var body: some View {
        VStack(alignment: .center, spacing: 12.0) {
            Spacer()

            Text("Faustus")
                .font(Font.custom(.gothic, size: 80))
                .lineLimit(1)
                .frame(maxWidth: 250, maxHeight: 20)
                .multilineTextAlignment(.leading)
                .foregroundColor(Color.F.light)
                .offset(x: /*@START_MENU_TOKEN@*/0.0/*@END_MENU_TOKEN@*/, y: -80.0)

            if vm.user.state.isNew {
                TextInput(title: "Vorname", text: $vm.user.content.name, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaLight, size: 16), alignment: .left, isFocused: textFocus.id == .loginUserName, isSecure: false, format: nil, isEditable: !vm.filesLoading, onEnterAction: { self.textFocus.id = .loginUserSurname })
                    .frame(width: 250, height: 35, alignment: .leading)
                    .padding(.horizontal, 5)
                    .background(Color.F.black)
                    .cornerRadius(6)
                    .onAppear { self.textFocus.id = .loginUserName }

                TextInput(title: "Nachname", text: $vm.user.content.surname, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaExtraLight, size: 16), alignment: .left, isFocused: textFocus.id == .loginUserSurname, isSecure: false, format: nil, isEditable: !vm.filesLoading, onEnterAction: { self.textFocus.id = .loginUserPwd })
                    .frame(width: 250, height: 35, alignment: .leading)
                    .padding(.horizontal, 5)
                    .background(Color.F.black)
                    .cornerRadius(6)

                TextInput(title: "Schlüssel", text: $vm.user.content.pwd, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaLight, size: 16), alignment: .left, isFocused: textFocus.id == .loginUserPwd, isSecure: true, format: nil, isEditable: !vm.filesLoading, onEnterAction: {
                    self.vm.login()
                })
                    .frame(width: 250, height: 35, alignment: .leading)
                    .padding(.horizontal, 5)
                    .background(Color.F.black)
                    .cornerRadius(6)

            } else {
                HStack(alignment: .lastTextBaseline, spacing: 10) {
                    Text(vm.user.content.name)
                        .font(Font.custom(.pragmaticaExtraLight, size: 28))

                    Text(vm.user.content.surname)
                        .font(Font.custom(.pragmaticaBold, size: 28))

                }.lineLimit(1)
                    .foregroundColor(Color.F.black)
                    .frame(width: 250, height: 35)
                    .minimumScaleFactor(0.5)

                TextInput(title: "Schlüssel", text: $vm.user.content.pwd, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaLight, size: 16), alignment: .left, isFocused: textFocus.id == .loginUserPwd, isSecure: true, format: nil, isEditable: !vm.filesLoading, onEnterAction: {
                    self.vm.login()
                })
                    .frame(width: 250, height: 35, alignment: .leading)
                    .padding(.horizontal, 5)
                    .background(Color.F.black)
                    .cornerRadius(6)
                    .onAppear { self.textFocus.id = .loginUserPwd }
            }

            Text($vm.errorMsg.wrappedValue)
                .frame(maxWidth: 250, maxHeight: 50)
                .foregroundColor(Color.F.red)
                .opacity($vm.errorMsg.wrappedValue != "" ? 1 : 0)

            ActivityIndicator(isAnimating: $vm.filesLoading)
                .frame(width: 50, height: 50)

            Spacer().frame(height: 150)
            
            Text(vm.projectDir)
                .font(Font.custom(.mono, size: 13))
                .foregroundColor(Color.F.black)
            
            Spacer().frame(height: 20)
        }
    }
}

#if DEBUG
    struct LoginView_Previews: PreviewProvider {
        static var previews: some View {
            LoginView()
        }
    }
#endif
