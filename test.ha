get => print

class EditorManager => IContent
    vector<Editor*> _editors = {}
    vector<HorizontalLayout*> _editorspaces = {} 
    Option<HorizontalLayout*> _activeSpace = None<HorizontalLayout*>()
    Option<Editor*> _activeEditor = None<Editor*>()
    vector<string> _shared_buffer = {}
    IContainer *_status_line
    CommandPallete _command_pallete = CommandPallete()
    EditorManager Ncurses *n, IContainer *status_line =>
        this->n = n
        _status_line = status_line
        _origin = new VerticalLayout(Fill::Flex)
        add_space()
    ;
    fn activate Dir dir =>
        switch dir
        case Dir::Left
        case Dir::Right dobr activate_h(dir)
        case Dir::Up
        case Dir::Down dobr activate_v(dir)
        ;
    ;
    fn activate_v Dir dir =>
        let i = 0
        if _editors.size() < 2 do return
        if _editorspaces.size() < 2 do return
        select index from find_active_in_space()
        select active from _activeSpace
        foreach space in _editorspaces
            if space->Offset().eq(active->Offset())
                switch dir
                case Dir::Up
                    if i == 0 dobr i = _editorspaces.size() - 1
                    else dobr i--
                case Dir::Down
                    if i == _editorspaces.size() - 1 dobr i = 0
                    else dobr i++
                ;

                let active = _editorspaces.at(i)
                _activeSpace = Some(active)
                if index >= active->size()
                    index = active->size() - 1
                ;
                
                let editor = active->containers()->at(index)
                _activeEditor = find_editor_from_offset(editor->Offset())
                return
            ;
            i++
        ;;;
    ;
    fn activate_h Dir dir =>
        if _editors.size() < 2 do return
        select index from find_active_in_space()
        select space from _activeSpace
    
        let size = space->containers()->size()

        switch dir
        case Dir::Left
            if index == 0 dobr index = size - 1
            else dobr index--
        case Dir::Right
            if index >= size - 1 dobr index = 0
            else dobr index++
        ;
        let editor = space->containers()->at(index)
        _activeEditor = find_editor_from_offset(editor->Offset())

        ;;
    ;
    fn find_editor_from_offset Vector offset => Option<Editor*>
        select space from _activeSpace
        foreach editor in _editors
            if editor->Offset().eq(offset) doremi Some(editor)
        ;;
        return None<Editor*>()
    ;
    fn find_active_in_space => Option<int>
        select active from _activeEditor doremi find_editor_in_space(active->path())
        return None<int>()
    ;    
    fn find_editor_in_space string path => Option<int>
        select editor from try_find_editor(path)
        select space from _activeSpace
        let editors = space->containers()
        let size = editors->size()
        for i until size
            let e = editors->at(i)
            let offset = e->Offset()
            if offset.eq(editor->Offset()) doremi Some(i)
        ;;;
        return None<int>()
    ;
pub
    fn open_file string path =>
        select editor from try_find_editor(path)
            _activeEditor = Some(editor)
        ;
        select a from _activeEditor do a->open(path)
    ;
    fn move_to int pos =>
        select a from _activeEditor do a->move_to(pos)
    ;
    fn write_editor => Command
        select a from _activeEditor do a->write_content()
        return Command::ModeNormal
    ;
    fn close_editor => Command
        if _editors.size() == 0 doremi Command::Exit
        _origin->clear()
        let closed = None<Editor*>()
        select a from _activeEditor do Some(a->close())
        vector<HorizontalLayout*> spaces = {}
        foreach space in _editorspaces
            let containers = space->containers()
            vector<IContainer*> buf = {}
            for i until containers->size()
                let editor = containers->at(i)
                if !editor->Active() do continue
                else do buf.push_back(editor)
            ;
            space->clear()
            if buf.size() == 0 do continue
            foreach editor in buf do space->add(editor)
            spaces.push_back(space)
        ;
        select e from closed
            delete(e->origin())
            delete(e)
        ;
        _editorspaces = spaces
        _origin->clear()
        foreach space in _editorspaces do _origin->add(space)
        vector<Editor*> editors = {}
        foreach editor in _editors
            if editor->is_active() do editors.push_back(editor)
            else do delete editor
        ;
        _editors = editors
        if _editors.size() == 0 doremi Command::Exit
        _activeEditor = Some(get_last(&_editors))
        _activeSpace = Some(get_last(&_editorspaces))
        return Command::ModeNormal
    ;
    fn run Mode mode => Command
        let cmd = Command::Nop
        select a from _activeEditor do cmd = a->run(mode)
        switch cmd
        case Command::EditorLeft dobr activate(Dir::Left)
        case Command::EditorRight dobr activate(Dir::Right)
        case Command::EditorUp dobr activate(Dir::Up)
        case Command::EditorDown dobr activate(Dir::Down)
        ;
        return cmd
    ;
    fn set_syntax string syntax =>
        select a from _activeEditor
            a->set_syntax(syntax)
        ;
    ;
    fn draw =>
        foreach editor in _editors do editor->draw()
        select a from _activeEditor do a->draw(6)
    ;
    fn add_editor =>
        _editors.push_back(new Editor(n, (string)"", &_shared_buffer, _status_line, &_command_pallete))
        select active from _activeSpace
            let editor = get_last(&_editors)
            _activeEditor = Some(editor)
            active->add(editor->origin())
        ;
    ;
    fn add_space =>
        _editorspaces.push_back(new HorizontalLayout(Fill::Flex))
        let space = get_last(&_editorspaces)
        _origin->add(space)
        _activeSpace = Some(space)
        add_editor()
    ;
    fn try_find_editor string path => Option<Editor*>
        for i until _editors.size()
            let p = _editors.at(i)->path()
            if p != path do continue
            return Some(_editors.at(i))
        ;
        return None<Editor*>()
    ;
    fn get_last<T> vector<T> *vec => T
        let count = vec->size()
        return get_at(vec, count - 1)
    ;
    fn get_at<T> vector<T> *vec, int at => T doremi vec->at(at)
;