function [players, selectedList] = selectPlayers(players, selectedList)

players{1,7} = 'selected';

if nargin == 1
    exitLoop = 0;
    selectedPlayerCount = 0;
    selectedPlayers = [];
    while exitLoop == 0
        selectedPlayers
        userInput = input('Enter Active Players Rows, type e to exit, or type u to undo: ', 's');
        if strcmpi(userInput, 'e')
            break
        elseif strcmpi(userInput, 'u') && selectedPlayerCount > 0
            selectedPlayersTemp = selectedPlayers(1:selectedPlayerCount-1,:);
            selectedPlayers = [];
            selectedPlayers = selectedPlayersTemp;
            selectedPlayerCount = selectedPlayerCount - 1;
        else
            selectedPlayerCount = selectedPlayerCount + 1;
            selectedPlayers{selectedPlayerCount,1} = str2double(userInput);
            selectedPlayers{selectedPlayerCount,2} = players{selectedPlayers{selectedPlayerCount,1},2};
        end
    end
    for playerIndex = 2:size(players,1)
        players{playerIndex,7} = 0;
        for selectedPlayerIndex = 1:size(selectedPlayers,1)
            if playerIndex == selectedPlayers{selectedPlayerIndex,1}
                players{playerIndex,7} = 1;
            end
        end
    end
else
    if strcmp(selectedList,'all')
        for index = 2:size(players,1)
            players{index,7} = 1;
        end
    else
        players(:,7) = selectedList;
    end
end

selectedList = players(:,7);

end