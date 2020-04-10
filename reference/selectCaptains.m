function [players, captainsList] = selectCaptains(players, captainList)

players{1,8} = 'captain';

if nargin == 1
    exitLoop = 0;
    captainCount = 0;
    captains = [];
    while exitLoop == 0
        captains
        userInput = input('Enter Captain Row, type e to exit, or type u to undo: ', 's');
        if strcmpi(userInput, 'e')
            break
        elseif strcmpi(userInput, 'u') && captainCount > 0
            captainsTemp = captains(1:captainCount-1,:);
            captains = [];
            captains = captainsTemp;
            captainCount = captainCount - 1;
        else
            captainCount = captainCount + 1;
            captains{captainCount,1} = str2double(userInput);
            captains{captainCount,2} = players{captains{captainCount,1},2};
        end
    end
    
    for playerIndex = 2:size(players,1)
        players{playerIndex,8} = 0;
        for captainIndex = 1:size(captains,1)
            if playerIndex == captains{captainIndex,1}
                players{playerIndex,8} = 1;
            end
        end
    end
else
    if strcmp(captainList,'auto')
        ADCc = 0;
        for index = 1:size(players,1)
            if strcmp(players{index,1},'ADC')
                ADCc = ADCc + 1;
                if ADCc == 3 || ADCc == 4 || ADCc == 5
                    players{index,8} = 1;
                end
            end
        end
    else
        players(:,8) = captainList;
    end
end

captainsList = players(:,8);

end
