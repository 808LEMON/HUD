local hudVisible = true
local stress = 0
local hunger = 100
local thirst = 100
local harness = false

RegisterNetEvent('hud:client:UpdateNeeds', function(newHunger, newThirst)

    hunger = tonumber(newHunger) or hunger
    thirst = tonumber(newThirst) or thirst

    TriggerEvent(
        'lemon-hud:client:updateNeeds',
        hunger,
        thirst
    )

end)

RegisterNetEvent('hud:client:UpdateStress', function(newStress)

    stress = tonumber(newStress) or stress

    TriggerEvent(
        'lemon-hud:client:updateStress',
        stress
    )

end)

RegisterNetEvent('hud:client:ShowAccounts', function()
    TriggerEvent('lemon-hud:client:setVisible', true)
end)

RegisterNetEvent('hud:client:HideAccounts', function()
    TriggerEvent('lemon-hud:client:setVisible', false)
end)

RegisterNetEvent('hud:client:SetHarness', function(state)

    harness = state == true

    SendNUIMessage({
        action = 'setHarness',
        state = harness
    })

end)

RegisterNetEvent('hud:client:ToggleAirHud', function()
    hudVisible = not hudVisible

    TriggerEvent(
        'lemon-hud:client:setVisible',
        hudVisible
    )
end)

exports('SetHudVisible', function(state)
    TriggerEvent(
        'lemon-hud:client:setVisible',
        state == true
    )
end)

exports('SetSeatbelt', function(state)
    TriggerEvent(
        'lemon-hud:client:setSeatbelt',
        state == true
    )
end)

exports('UpdateNeeds', function(newHunger, newThirst)
    TriggerEvent(
        'lemon-hud:client:updateNeeds',
        newHunger,
        newThirst
    )
end)

exports('UpdateStress', function(newStress)
    TriggerEvent(
        'lemon-hud:client:updateStress',
        newStress
    )
end)