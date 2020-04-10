function lineups = createLineups(players, Teams)

lineups = [];
lineupsCount = 0;
for index = 2:size(players,1)
    if players{index,8} == 1
        if strcmp(players{index,1},'ADC')
            lineupsCount = lineupsCount + 1;
            lineups{lineupsCount,1} = players{index,3};
            lineups{lineupsCount,1+7} = players{index,4}; % salary;
            lineups{lineupsCount,1+14} = players{index,5}; % team
            lineups{lineupsCount,1+21} = players{index,6}; % opponent
            for index2 = 2:size(players,1)
                if strcmp(players{index2,1}, 'SUP') && strcmp(players{index2,6},players{index,6})
                    lineups{lineupsCount,6} = players{index2,3};
                    lineups{lineupsCount,6+7} = players{index2,4};
                    lineups{lineupsCount,6+14} = players{index2,5};
                    lineups{lineupsCount,6+21} = players{index2,6};
                end
            end
            for index2 = 1:size(Teams,2)
                if ~strcmp(Teams(index2).teamName,lineups{lineupsCount,1+14}) && ~strcmp(Teams(index2).teamName,lineups{lineupsCount,1+21})
                    lineups(end+1,:) = lineups(lineupsCount,:);
                    for index3 = 1:size(Teams(index2).Players,2)
                        if strcmp(Teams(index2).Players(index3).position,'TOP')
                            rowID = Teams(index2).Players(index3).rowID;
                            lineups{lineupsCount,2} = players{rowID,3};
                            lineups{lineupsCount,2+7} = players{rowID,4};
                            lineups{lineupsCount,2+14} = players{rowID,5};
                            lineups{lineupsCount,2+21} = players{rowID,6};
                        end
                        if strcmp(Teams(index2).Players(index3).position,'JNG')
                            rowID = Teams(index2).Players(index3).rowID;
                            lineups{lineupsCount,3} = players{rowID,3};
                            lineups{lineupsCount,3+7} = players{rowID,4};
                            lineups{lineupsCount,3+14} = players{rowID,5};
                            lineups{lineupsCount,3+21} = players{rowID,6};
                        end
                        if strcmp(Teams(index2).Players(index3).position,'MID')
                            rowID = Teams(index2).Players(index3).rowID;
                            lineups{lineupsCount,4} = players{rowID,3};
                            lineups{lineupsCount,4+7} = players{rowID,4};
                            lineups{lineupsCount,4+14} = players{rowID,5};
                            lineups{lineupsCount,4+21} = players{rowID,6};
                        end
                        if strcmp(Teams(index2).Players(index3).position,'ADC')
                            rowID = Teams(index2).Players(index3).rowID;
                            lineups{lineupsCount,5} = players{rowID,3};
                            lineups{lineupsCount,5+7} = players{rowID,4};
                            lineups{lineupsCount,5+14} = players{rowID,5};
                            lineups{lineupsCount,5+21} = players{rowID,6};
                        end
                    end
                    lineupsCount = lineupsCount + 1;
                end
            end
        end
    end
end

l2c = 0;
for index = 1:size(lineups,1)
    if ~isempty(lineups{index,2})
        l2c = l2c + 1;
        lineups2(l2c,:) = lineups(index,:);
    end
end
lineups = [];
lineups = lineups2;

for index = 1:size(lineups,1)
    for index2 = 2:size(players,1)
        if strcmp(players{index2,1},'TEAM')
            if ~strcmp(players{index2,1}, lineups{index,1+21}) && ~strcmp(players{index2,1}, lineups{index,2+21})
                lineups(end+1, :) = lineups(index,:);
                lineups{index,7} = players{index2,3};
                lineups{index,7+7} = players{index2,4};
                lineups{index,7+14} = players{index2,5};
                lineups{index,7+21} = players{index2,6};
            end
        end
    end
end

l2c = 0;
for index = 1:size(lineups,1)
    if ~isempty(lineups{index,7})
        l2c = l2c + 1;
        lineups3(l2c,:) = lineups(index,:);
    end
end
lineups = [];
lineups = lineups3;

% Trim salary lineups
l2c = 0;
for index = 1:size(lineups,1)
    if 1.5 * lineups{index,1+7} + lineups{index,2+7} + lineups{index,3+7} +lineups{index,4+7} + lineups{index,5+7} ...
            + lineups{index,6+7} + lineups{index,7+7} < 50000
        l2c = l2c + 1;
        lineups4(l2c,:) = lineups(index,:);
    end
end
lineups = [];
lineups = lineups4;

end