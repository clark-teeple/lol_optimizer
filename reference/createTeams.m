function Teams = createTeams(players)

Teams(1).teamName = players{2,6};
for index = 3:size(players,1)
    teamName = players{index,6};
    newTeamFlag = 1;
    for index2 = 1:size(Teams,2)
        if strcmp(Teams(index2).teamName,teamName)
            newTeamFlag = 0;
        end
    end
    if newTeamFlag == 1
        Teams(size(Teams,2)+1).teamName = teamName;
    end
end

Teams(1).Players = [];
for index = 2:size(players,1)
    for index2 = 1:size(Teams,2)
        if strcmp(Teams(index2).teamName,players{index,6})
            Teams(index2).Players(size(Teams(index2).Players,2)+1).playerID = players{index, 3};
            Teams(index2).Players(size(Teams(index2).Players,2)).position = players{index,1};
            Teams(index2).Players(size(Teams(index2).Players,2)).rowID = index;
        end
    end
end

end