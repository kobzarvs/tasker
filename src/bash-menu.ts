export const buildBashMenuScript = (items: string[]): string => `
function cleanup() {
    tput cnorm
}

trap cleanup EXIT

function choose_from_menu() {
    local prompt="$1" selected="$2" result="$3"
    shift 3
    local options=("$@") count=\${#options[@]} cur=0 index=0
    local esc=$(echo -en "\\e")
    local key=""
    local re_number="^[0-9]+$"

    local PgUpKey="[5~"
    local PgDownKey="[6~"
    local HomeKey="[H"
    local EndKey="[F"
    local UpKey="[A"
    local DownKey="[B"
    local RightKey="[C"
    local LeftKey="[D"
    local EscKey="ESC"
    local EnterKey="Enter"
    local DeleteKey="[3~"
    local InsertKey="[2~"

    max=$(for menu_item in $@; do echo "\${#menu_item}"; done | sort -nr | head -1)

    tput civis
    printf "$prompt\n"

    function show_menu() {
        local index=0
        for o in "\${options[@]}"
        do
            if [[ "$index" == "$cur" ]]; then
                # active menu item
                printf -v item " $((index + 1))) \\e[7m %-\${max}s \\e[0m" "$o"
                echo -e "$item"
            else 
                printf -v item " $((index + 1)))  %-\${max}s " "$o"
                echo "$item"
            fi
            index=$(( $index + 1 ))
        done
    }
    
    while true
    do
        show_menu

        key=""
        while true
        do
            input1=""
            input2=""
            read -s -n 1 input1
            
            if [[ $input1 != "" ]]; then
                if [[ $input1 == $esc ]]; then
                    read -s -t 0.01 -N 3 input2

                    if [[ $input1 == $esc && $input2 == "" ]]; then
                        key="ESC"
                    else
                        key=$input2
                    fi
                else
                    key=$input1
                fi
            else
                key="Enter"
            fi
            if [[ $key != "" ]]; then
                break
            fi
        done

        if [[ $key == $UpKey || $key == $LeftKey ]]; then
            cur=$(( $cur - 1 ))
            [ "$cur" -lt 0 ] && cur=0
        elif [[ $key == $DownKey || $key == $RightKey ]]; then
            cur=$(( $cur + 1 ))
            [ "$cur" -ge $count ] && cur=$((count - 1))
        elif [[ $key == $HomeKey || $key == $PgUpKey ]]; then
            cur=0
        elif [[ $key == $EndKey || $key == $PgDownKey ]]; then
            cur=$((count - 1))
        elif [[ $key == $EscKey ]]; then
            printf -v $result ""
            printf -v $selected 0
            break
        elif [[ $key == $EnterKey ]]; then
            printf -v $result "\${options[$cur]}"
            printf -v $selected "\$((cur + 1))"
            break
        elif [[ $key =~ $re_number && $key -ge 1 && $key -le $count ]]; then
            printf -v $result "\${options[$((key - 1))]}"
            printf -v $selected "$key"
            break
        fi

        # jump to first menu item
        echo -en "\\e[\${count}A"
    done

    echo -en "\\e[$((count + 1))A\\e[$((\${#prompt} + 1))C"
    tput cnorm
}

selections=(${items.map(i => `"${i}"`).join(' ')})

choose_from_menu "Please make a choice:" selected_index selected_choice "\${selections[@]}"

if [[ $selected_index == 0 ]]; then
    echo -e "\\e[31mNone\\e[0m"
else
    echo -e "\\e[96m$selected_choice\\e[0m"
fi

tput ed

exit $selected_index
`;
