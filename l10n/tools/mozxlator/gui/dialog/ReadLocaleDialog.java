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
package org.mozilla.translator.gui.dialog;

import java.io.*;
import javax.swing.*;

import org.mozilla.translator.datamodel.*;
import org.mozilla.translator.gui.*;
import org.mozilla.translator.kernel.*;
import javax.swing.*;
/**
 *
 * @author  Henrik
 * @version
 */
public class ReadLocaleDialog extends javax.swing.JDialog {
    
    /** Creates new form ImportOldGlossaryDialog */
    public ReadLocaleDialog() {
        super (MainWindow.getDefaultInstance(),"import translarion from mozilla",true);
        initComponents ();
        getRootPane().setDefaultButton(okButton);
        pack ();

        Utils.placeFrameAtCenter(this);
    }

    /** This method is called from within the constructor to
     * initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is
     * always regenerated by the FormEditor.
     */
    private void initComponents() {//GEN-BEGIN:initComponents
        infPanel = new javax.swing.JPanel();
        fileLabel = new javax.swing.JLabel();
        fileField = new javax.swing.JTextField();
        fileButton = new javax.swing.JButton();
        installLabel = new javax.swing.JLabel();
        installCombo = new JComboBox(Glossary.getDefaultInstance().toArray());
        localeLabel = new javax.swing.JLabel();
        localeField = new javax.swing.JTextField();
        okButton = new javax.swing.JButton();
        cancelButton = new javax.swing.JButton();
        getContentPane().setLayout(new java.awt.GridBagLayout());
        java.awt.GridBagConstraints gridBagConstraints1;
        setDefaultCloseOperation(javax.swing.WindowConstants.DO_NOTHING_ON_CLOSE);
        
        infPanel.setLayout(new java.awt.GridBagLayout());
        java.awt.GridBagConstraints gridBagConstraints2;
        infPanel.setBorder(new javax.swing.border.TitledBorder(
        new javax.swing.border.EtchedBorder(), "Information", 4, 2,
        new java.awt.Font ("Dialog", 0, 10)));
        
        fileLabel.setText("Location");
          gridBagConstraints2 = new java.awt.GridBagConstraints();
          gridBagConstraints2.insets = new java.awt.Insets(3, 3, 3, 3);
          gridBagConstraints2.anchor = java.awt.GridBagConstraints.WEST;
          infPanel.add(fileLabel, gridBagConstraints2);
          
          
        fileField.setColumns(20);
          fileField.setText("D:\\preo\\fhbndj\\hoigtrod\\glossary.zip");
          gridBagConstraints2 = new java.awt.GridBagConstraints();
          gridBagConstraints2.insets = new java.awt.Insets(3, 0, 3, 0);
          gridBagConstraints2.anchor = java.awt.GridBagConstraints.WEST;
          infPanel.add(fileField, gridBagConstraints2);
          
          
        fileButton.setText("Choose");
          fileButton.addActionListener(new java.awt.event.ActionListener() {
              public void actionPerformed(java.awt.event.ActionEvent evt) {
                  fileButtonPressed(evt);
              }
          }
          );
          gridBagConstraints2 = new java.awt.GridBagConstraints();
          gridBagConstraints2.gridwidth = 0;
          gridBagConstraints2.insets = new java.awt.Insets(3, 0, 3, 3);
          gridBagConstraints2.anchor = java.awt.GridBagConstraints.WEST;
          infPanel.add(fileButton, gridBagConstraints2);
          
          
        installLabel.setText("Install");
          gridBagConstraints2 = new java.awt.GridBagConstraints();
          gridBagConstraints2.gridx = 0;
          gridBagConstraints2.gridy = 1;
          gridBagConstraints2.insets = new java.awt.Insets(0, 3, 3, 3);
          gridBagConstraints2.anchor = java.awt.GridBagConstraints.WEST;
          infPanel.add(installLabel, gridBagConstraints2);
          
          
        gridBagConstraints2 = new java.awt.GridBagConstraints();
          gridBagConstraints2.gridx = 1;
          gridBagConstraints2.gridy = 1;
          gridBagConstraints2.gridwidth = 0;
          gridBagConstraints2.fill = java.awt.GridBagConstraints.HORIZONTAL;
          gridBagConstraints2.insets = new java.awt.Insets(0, 0, 3, 3);
          gridBagConstraints2.anchor = java.awt.GridBagConstraints.WEST;
          infPanel.add(installCombo, gridBagConstraints2);
          
          
        localeLabel.setText("Locale");
          gridBagConstraints2 = new java.awt.GridBagConstraints();
          infPanel.add(localeLabel, gridBagConstraints2);
          
          
        localeField.setColumns(20);
          localeField.setText("jTextField1");
          gridBagConstraints2 = new java.awt.GridBagConstraints();
          infPanel.add(localeField, gridBagConstraints2);
          
          
        gridBagConstraints1 = new java.awt.GridBagConstraints();
        gridBagConstraints1.gridwidth = 0;
        gridBagConstraints1.insets = new java.awt.Insets(3, 3, 3, 3);
        getContentPane().add(infPanel, gridBagConstraints1);
        
        
        okButton.setText("OK");
        okButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                okButtonPressed(evt);
            }
        }
        );
        
        gridBagConstraints1 = new java.awt.GridBagConstraints();
        gridBagConstraints1.gridx = 0;
        gridBagConstraints1.gridy = 1;
        gridBagConstraints1.insets = new java.awt.Insets(0, 3, 3, 3);
        gridBagConstraints1.anchor = java.awt.GridBagConstraints.EAST;
        gridBagConstraints1.weightx = 0.5;
        getContentPane().add(okButton, gridBagConstraints1);
        
        
        cancelButton.setText("Cancel");
        cancelButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                cancelButtonPressed(evt);
            }
        }
        );
        
        gridBagConstraints1 = new java.awt.GridBagConstraints();
        gridBagConstraints1.gridx = 1;
        gridBagConstraints1.gridy = 1;
        gridBagConstraints1.gridwidth = 0;
        gridBagConstraints1.insets = new java.awt.Insets(0, 0, 3, 3);
        gridBagConstraints1.anchor = java.awt.GridBagConstraints.WEST;
        gridBagConstraints1.weightx = 0.5;
        getContentPane().add(cancelButton, gridBagConstraints1);
        
    }//GEN-END:initComponents

  private void fileButtonPressed (java.awt.event.ActionEvent evt) {//GEN-FIRST:event_fileButtonPressed
    File defaultFile = new File(fileField.getText());
    JFileChooser dirChooser = new JFileChooser();
    dirChooser.setFileSelectionMode(JFileChooser.FILES_AND_DIRECTORIES);
    dirChooser.setDialogTitle("Select locale directory or jar file to import");
    dirChooser.setSelectedFile(defaultFile);        
    int result = dirChooser.showDialog(this,"Choose");
    if (result==JFileChooser.APPROVE_OPTION)
    {
      File dir = dirChooser.getSelectedFile();
      fileField.setText(dir.toString());
    }
  }//GEN-LAST:event_fileButtonPressed

  private void okButtonPressed (java.awt.event.ActionEvent evt) {//GEN-FIRST:event_okButtonPressed
    okay=true;
    setVisible(false);
  }//GEN-LAST:event_okButtonPressed

  private void cancelButtonPressed (java.awt.event.ActionEvent evt) {//GEN-FIRST:event_cancelButtonPressed
    okay=false;
    setVisible(false);
  }//GEN-LAST:event_cancelButtonPressed

  public boolean visDialog()
  {
    MozInstall preSelect;

    fileField.setText(Settings.getString("saved.fileName.locale.import",""));
    localeField.setText(Settings.getString("saved.localeName",""));

    preSelect = (MozInstall) Glossary.getDefaultInstance().getChildByName(Settings.getString("saved.install",""));
    if (preSelect!=null)
    {
        installCombo.setSelectedItem(preSelect);
    }    
    setVisible(true);
    
    if (okay)
    {
        Settings.setString("saved.localeName",localeField.getText());
        Settings.setString("saved.fileName.locale.import",fileField.getText());    
        Settings.setString("saved.install",installCombo.getSelectedItem().toString());
    }
    
    return okay;
  }

    public String getFile()
    {
        return fileField.getText();
    }
    
    public MozInstall getInstall()
    {
        return (MozInstall) installCombo.getSelectedItem();
    }
    
    public String getLocaleName()
    {
        return localeField.getText();
    }

    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JPanel infPanel;
    private javax.swing.JLabel fileLabel;
    private javax.swing.JTextField fileField;
    private javax.swing.JButton fileButton;
    private javax.swing.JLabel installLabel;
    private javax.swing.JComboBox installCombo;
    private javax.swing.JLabel localeLabel;
    private javax.swing.JTextField localeField;
    private javax.swing.JButton okButton;
    private javax.swing.JButton cancelButton;
    // End of variables declaration//GEN-END:variables
    private boolean okay;
}