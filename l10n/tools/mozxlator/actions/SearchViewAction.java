/*
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 *  except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/

 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 *
 * The Original Code is MozillaTranslator (Mozilla Localization Tool)
 *
 * The Initial Developer of the Original Code is Henrik Lynggaard Hansen
 *
 * Portions created by Henrik Lynggard Hansen are
 * Copyright (C) Henrik Lynggaard Hansen.
 * All Rights Reserved.
 *
 * Contributor(s):
 * Henrik Lynggaard Hansen (Initial Code)
 *
 */
package org.mozilla.translator.actions;

import java.awt.event.*;
import javax.swing.*;
import java.util.*;
import java.io.*;


import org.mozilla.translator.datamodel.*;
import org.mozilla.translator.gui.*;
import org.mozilla.translator.gui.dialog.*;
import org.mozilla.translator.gui.models.*;
import org.mozilla.translator.kernel.*;
import org.mozilla.translator.runners.*;
import org.mozilla.translator.fetch.*;
/**
 *
 * @author  Henrik
 * @version
 */
public class SearchViewAction extends AbstractAction {

    private int rule;
    private int column;
    private String rul;
    private String col;
    private boolean cc;
    

    /** Creates new SearchViewAction */
    public SearchViewAction()
    {
        super("Simple Search",null);
    }

    public void actionPerformed(ActionEvent evt)
    {
        List collectedList;
        String lname,text;
        MainWindow mw = MainWindow.getDefaultInstance();
        SearchDialog sd = new SearchDialog(mw,true);
        
        
        boolean okay = sd.visDialog();

        if (okay)
        {
            rule= 0;
            column =0;
            rul = sd.getRule();
            col = sd.getColumn();
            lname = sd.getLocaleName();
            text = sd.getSearchText();
            cc = sd.getCase();
            
            
            assignRule(Filter.RULE_IS,"Is");
            assignRule(Filter.RULE_IS_NOT,"Is not");
            assignRule(Filter.RULE_CONTAINS,"Contains");
            assignRule(Filter.RULE_CONTAINS_NOT,"Doesn't contain");
            assignRule(Filter.RULE_STARTS_WITH,"Starts with");
            assignRule(Filter.RULE_ENDS_WITH,"Ends with");

            assignColumn(Filter.FIELD_KEY,"Key");
            assignColumn(Filter.FIELD_NOTE,"Localization note");
            assignColumn(Filter.FIELD_ORG_TEXT,"Original text");
            assignColumn(Filter.FIELD_TRANS_TEXT,"Translated text");
            assignColumn(Filter.FIELD_COMMENT,"QA comment");

            
            
            Filter search = new Filter(rule,column,text,cc,lname);
            
            
            ShowWhatDialog swd = new ShowWhatDialog();
            swd.disableLocaleField();
            if (swd.visDialog())                
            {
                String localeName = swd.getSelectedLocale();
                List cols = swd.getSelectedColumns();
                Fetcher sf= new FetchSearch(search);
                collectedList  = FetchRunner.getFromGlossary(sf);
                Collections.sort(collectedList);
                ComplexTableWindow ctw = new ComplexTableWindow("Found Strings",collectedList,cols,localeName);
            }
        }        
    }

    private void assignRule(int value,String comp)
    {
        if (rul.equals(comp))
        {
            rule = value;
        }
    }

    private void assignColumn(int value,String comp)
    {
        if (col.equals(comp))
        {
            column = value;
        }
    }

}