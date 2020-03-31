//
//  ContentView.swift
//  Faustus
//
//  Created by Alexander Dittner on 06.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

struct LoginView: View {
    @ObservedObject var vm = LoginViewModel()

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

            TextInput(title: "Name", text: $vm.user.name, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaLight, size: 14), alignment: .left, isFocused: vm.user.name == "", isSecure: false, format: nil, isEditable: true, onEnterAction: nil)
                .frame(width: 250, height: 35, alignment: .leading)
                .padding(.horizontal, 5)
                .background(Color.F.black)
                .cornerRadius(6)

            TextInput(title: "Schlüssel", text: $vm.user.pwd, textColor: NSColor.F.white, font: NSFont(name: .pragmaticaLight, size: 14), alignment: .left, isFocused: vm.user.name != "", isSecure: true, format: nil, isEditable: true, onEnterAction: {
                self.vm.login()
            })
                .frame(width: 250, height: 35, alignment: .leading)
                .padding(.horizontal, 5)
                .background(Color.F.black)
                .cornerRadius(6)

            Text($vm.errorMsg.wrappedValue)
                .frame(maxWidth: 250, maxHeight: 50)
                .foregroundColor(Color.F.invalid)
                .opacity($vm.errorMsg.wrappedValue != "" ? 1 : 0)

            Spacer()
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
