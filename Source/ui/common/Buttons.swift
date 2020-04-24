//
//  Buttons.swift
//  Faustus
//
//  Created by Alexander Dittner on 21.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

struct IconToggleStyle: ToggleStyle {
    var iconName: String
    var iconColor: Color
    var bgColor: Color
    let width: CGFloat = 30
    let height: CGFloat = 30

    func makeBody(configuration: Self.Configuration) -> some View {
        ZStack(alignment: .center) {
            RoundedRectangle(cornerRadius: 2)
                .foregroundColor(configuration.isOn ? iconColor : bgColor)

            Image(iconName)
                .renderingMode(.template)
                .foregroundColor(configuration.isOn ? bgColor : iconColor)
        }
        .frame(width: width, height: height)
        .onTapGesture {
            withAnimation {
                if !configuration.isOn {
                    configuration.$isOn.wrappedValue.toggle()
                }
            }
        }
    }
}

struct CollapseToggleStyle: ToggleStyle {
    let width: CGFloat = 20
    let height: CGFloat = 20

    func makeBody(configuration: Self.Configuration) -> some View {
        ZStack(alignment: .center) {
            RoundedRectangle(cornerRadius: 2)
                .foregroundColor(configuration.isOn ? Color.F.black : Color.F.clear)

            Image("dropdown")
                .renderingMode(.template)
                .foregroundColor(configuration.isOn ? Color.F.white : Color.F.black)
                .rotationEffect(Angle(degrees: configuration.isOn ? 0 : -90))
        }
        .frame(width: width, height: height)
        .onTapGesture {
            withAnimation {
                configuration.$isOn.wrappedValue.toggle()
            }
        }
    }
}

struct RoundToggleStyle: ToggleStyle {
    var onColor: Color
    var disabled: Bool = false
    let width: CGFloat = 50
    let height: CGFloat = 30

    func makeBody(configuration: Self.Configuration) -> some View {
        ZStack(alignment: .center) {
            if disabled {
                RoundedRectangle(cornerRadius: 2)
                    .stroke(lineWidth: 1)
                    .foregroundColor(configuration.isOn ? onColor : Color.F.white)

                Circle()
                    .stroke(lineWidth: 1)
                    .fill(Color.F.white)
                    .frame(width: 25, height: 25)
                    .offset(x: configuration.isOn ? 10 : -10, y: 0)
            } else {
                RoundedRectangle(cornerRadius: 2)
                    .foregroundColor(configuration.isOn ? onColor : Color.F.white)

                Circle()
                    .fill(Color.F.black)
                    .frame(width: 25, height: 25)
                    .offset(x: configuration.isOn ? 10 : -10, y: 0)
            }
        }
        .frame(width: width, height: height)
        .onTapGesture {
            withAnimation {
                configuration.$isOn.wrappedValue.toggle()
            }
        }
    }
}

struct IconButtonStyle: ButtonStyle {
    var iconName: String
    var iconColor: Color
    var bgColor: Color
    var width: CGFloat = 30
    var height: CGFloat = 30
    var radius: CGFloat = 2

    func makeBody(configuration: Self.Configuration) -> some View {
        return ZStack(alignment: .center) {
            RoundedRectangle(cornerRadius: radius)
                .foregroundColor(configuration.isPressed ? iconColor : bgColor)

            Image(iconName)
                .renderingMode(.template)
                .foregroundColor(configuration.isPressed ? bgColor : iconColor)
        }
        .frame(width: width, height: height)
    }
}

struct CreateButtonStyle: ButtonStyle {
    var iconName: String
    let width: CGFloat = 50
    let height: CGFloat = 30

    public func makeBody(configuration: Self.Configuration) -> some View {
        return ZStack(alignment: .center) {
            RoundedRectangle(cornerRadius: 0)
                .foregroundColor(configuration.isPressed ? Color.F.black : Color.F.white)

            Image("smallPlus")
                .renderingMode(.template)
                .foregroundColor(configuration.isPressed ? Color.F.white : Color.F.black)
                .offset(x: -10, y: 0)

            Image(iconName)
                .renderingMode(.template)
                .foregroundColor(configuration.isPressed ? Color.F.white : Color.F.black)
                .offset(x: 5, y: 0)

        }.frame(width: width, height: height)
    }
}

struct GreenButtonStyle: ButtonStyle {
    func makeBody(configuration: Self.Configuration) -> some View {
        return ZStack(alignment: .center) {
            Color.F.green.opacity(configuration.isPressed ? 0.8 : 1)

            Image("ok")
                .renderingMode(.template)
                .foregroundColor(Color.F.white)
        }
    }
}

struct RedButtonStyle: ButtonStyle {
    func makeBody(configuration: Self.Configuration) -> some View {
        return ZStack(alignment: .center) {
            Color.F.red.opacity(configuration.isPressed ? 0.8 : 1)

            Image("close")
                .renderingMode(.template)
                .foregroundColor(Color.F.white)
        }
    }
}

#if DEBUG
    struct Buttons_Previews: PreviewProvider {
        static var previews: some View {
            VStack {
                Button("") {
                    print("button pressed!")
                }.buttonStyle(CreateButtonStyle(iconName: "tag"))
            }
        }
    }
#endif
